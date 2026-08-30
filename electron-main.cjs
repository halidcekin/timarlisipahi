/**
 * Mülk-i Osmanî - Steam & Desktop Main Process (Electron)
 * V2 Devir Sözleşmesi Güvenlik Standartları (G0-08):
 * - contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true
 * - app.getPath('userData')/saves altında güvenli dosya tabanlı kayıt IPC'si
 * - Dış yönlendirmeler ve yeni pencere talepleri varsayılan olarak engellenir
 */
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, session } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// GPU Donanım Hızlandırma ve Yüksek Performans Bayrakları
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('high-dpi-support', '1');

let mainWindow;
let localServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.obj': 'text/plain',
  '.mtl': 'text/plain',
  '.fbx': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

// Kayıt Dizinini Hazırla
function getSavesDir() {
  const savesDir = path.join(app.getPath('userData'), 'saves');
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir, { recursive: true });
  }
  return savesDir;
}

// Güvenli Kayıt IPC Handler'ları
function setupSaveIPC() {
  const ALLOWED_SLOTS = ['auto_a', 'auto_b', 'chapter', 'manual'];

  ipcMain.handle('save:write', async (event, { slot, data }) => {
    if (!ALLOWED_SLOTS.includes(slot)) {
      throw new Error(`Yasaklı kayıt slotu: ${slot}`);
    }
    const savesDir = getSavesDir();
    const filePath = path.join(savesDir, `${slot}.json`);
    const tempPath = path.join(savesDir, `${slot}.tmp`);

    const jsonStr = JSON.stringify(data, null, 2);
    // Atomik yazma: Önce temp'e yaz, sonra rename et
    fs.writeFileSync(tempPath, jsonStr, 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  });

  ipcMain.handle('save:read', async (event, slot) => {
    if (!ALLOWED_SLOTS.includes(slot)) {
      throw new Error(`Yasaklı kayıt slotu: ${slot}`);
    }
    const filePath = path.join(getSavesDir(), `${slot}.json`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`[SaveIPC] Kayıt okuma hatası (${slot}):`, e);
      return null;
    }
  });

  ipcMain.handle('save:list', async () => {
    const savesDir = getSavesDir();
    const list = {};
    for (const slot of ALLOWED_SLOTS) {
      const filePath = path.join(savesDir, `${slot}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          list[slot] = {
            slot,
            updatedAtUtc: stats.mtime.toISOString(),
            meta: content.meta || {}
          };
        } catch (e) {}
      }
    }
    return list;
  });
}

function startProjectServer(callback) {
  const rootDir = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
    ? path.join(__dirname, 'dist')
    : __dirname;

  localServer = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'public', reqPath);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, reqPath);
    }

    // Path traversal koruması
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(__dirname))) {
      res.writeHead(403);
      res.end('Access Denied');
      return;
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' blob: data:; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com;",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      });
      fs.createReadStream(resolvedPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  localServer.listen(0, '127.0.0.1', () => {
    const port = localServer.address().port;
    callback(`http://127.0.0.1:${port}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    fullscreen: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0806',
    title: 'Mülk-i Osmanî: Köy Beyliği 3D',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'electron-preload.cjs')
    }
  });

  mainWindow.maximize();

  // Dış navigation koruması
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsed = new URL(navigationUrl);
    if (parsed.origin !== `http://127.0.0.1:${localServer?.address()?.port}`) {
      event.preventDefault();
      console.warn('[Security] Dış yönlendirme engellendi:', navigationUrl);
    }
  });

  // Yeni pencere açma taleplerini reddet
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Güvenlik: Yalnızca zararsız izinlere onay ver, diğerlerini reddet (kamera, mikrofon vs.)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'pointerLock' || permission === 'fullscreen') {
      callback(true);
    } else {
      callback(false);
    }
  });

  startProjectServer((url) => {
    mainWindow.loadURL(url).then(() => {
      mainWindow.focus();
    });
  });

  // Geliştirici Kısayolları (F5, Ctrl+R, F12, F11)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      mainWindow.reload();
      event.preventDefault();
    } else if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    } else if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupSaveIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (localServer) {
    try {
      localServer.close();
    } catch (e) {}
  }
});
