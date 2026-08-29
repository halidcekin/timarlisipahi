/**
 * Mülk-i Osmanî - Steam & Desktop Main Process (Electron)
 * Steamworks SDK, Tam Ekran, Gamepad ve VSync Desteği
 */
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
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
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
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

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
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
    title: 'Mülk-i Osmanî: Tımarlı Sipahi 3D',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'electron-preload.cjs')
    }
  });

  mainWindow.maximize();

  // Daima bu projeye (yeni3d) ait izole yerel sunucuyu aç
  startProjectServer((url) => {
    mainWindow.loadURL(url);
  });

  // Geliştirici ve Yenileme Tuş Kısayolları (F5, Ctrl+R, F12)
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
