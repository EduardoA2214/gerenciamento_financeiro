const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const userDataPath = app.getPath('userData');

function ensureJwtSecret() {
  const secretPath = path.join(userDataPath, '.jwt-secret');
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8').trim();
  }

  const secret = crypto.randomBytes(48).toString('hex');
  fs.mkdirSync(userDataPath, { recursive: true });
  fs.writeFileSync(secretPath, secret, 'utf8');
  return secret;
}

process.env.DB_PATH = path.join(userDataPath, 'banco.db');
process.env.JWT_SECRET = ensureJwtSecret();
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

let mainWindow;
let apiServer;

async function startBackend() {
  const { startServer } = require('../server/server');
  const { server, port } = await startServer(4001);
  apiServer = server;
  return port;
}

function createWindow(apiPort) {
  mainWindow = new BrowserWindow({
    show: false,
    fullscreen: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape' && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath, { search: `apiPort=${apiPort}` });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

Menu.setApplicationMenu(null);

app.whenReady().then(async () => {
  try {
    const apiPort = await startBackend();
    createWindow(apiPort);
  } catch (error) {
    console.error('Falha ao iniciar o backend:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startBackend().then(createWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (apiServer) apiServer.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
