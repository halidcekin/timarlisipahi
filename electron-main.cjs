/**
 * Mülk-i Osmanî - Steam & Desktop Main Process (Electron)
 * Steamworks SDK, Tam Ekran, Gamepad ve VSync Desteği
 */
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');

// GPU Donanım Hızlandırma ve Yüksek Performans Bayrakları
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('high-dpi-support', '1');

let mainWindow;

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

  // Vite Dev Sunucusu Kontrolü (Port 5173 veya 3000)
  const devUrl = 'http://localhost:5173';
  const req = http.get(devUrl, (res) => {
    mainWindow.loadURL(devUrl);
  });

  req.on('error', () => {
    const backupUrl = 'http://localhost:3000';
    const backupReq = http.get(backupUrl, (res) => {
      mainWindow.loadURL(backupUrl);
    });
    backupReq.on('error', () => {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      mainWindow.loadFile(indexPath);
    });
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
