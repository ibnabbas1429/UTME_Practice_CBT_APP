import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase } from '@/database';
import { registerIpcHandlers } from './ipc/handlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createMainWindow = async (): Promise<void> => {
  // Initialize database
  await initDatabase();

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'UTME CBT System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !app.isPackaged,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Register IPC handlers
  registerIpcHandlers(ipcMain, mainWindow);

  // Load the index.html of the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Create window when app is ready
  app.whenReady().then(createMainWindow);
}

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Handle exam mode (fullscreen, disable shortcuts)
export const enableExamMode = (enable: boolean): void => {
  if (!mainWindow) return;

  if (enable) {
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setKiosk(true);
  } else {
    mainWindow.setKiosk(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setFullScreen(false);
  }
};