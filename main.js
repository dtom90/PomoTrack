/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

// Use NODE_ENV to determine development status (like the old script)
const isDevelopment = process.env.NODE_ENV === 'development'

// Set different app name for development to avoid profile/cache conflicts
if (isDevelopment) {
  app.setName('PomoTrack Dev')
}
const productName = app.getName();
log.info(`App name: ${productName}`);

// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Configure auto-updater
autoUpdater.autoDownload = false; // We will prompt the user

// Keep a global reference of the window object
let mainWindow;

function sendStatusToWindow(text) {
  log.info(text);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('message', text); // Send message to renderer
  }
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // From old script: security settings
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Keep existing preload script link
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html of the app.
  if (isDevelopment) {
    // In development, load the Vite dev server URL (adjust port if needed)
    mainWindow.loadURL('http://localhost:5173');
    // Optional: Open DevTools automatically in development
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html file
    const indexPath = path.join(__dirname, 'dist_web/index.html')
    mainWindow.loadFile(indexPath).then(() => {
      // Check for updates after loading the production build
      log.info('Checking for updates after loading production build...');
      autoUpdater.checkForUpdates();
    }).catch(err => {
      log.error('Failed to load production index.html:', err)
      dialog.showErrorBox('Load Error', `Failed to load application file: ${indexPath}\n${err.message}`)
    })
  }

  // Open links in the default browser window (from old script)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Instruct the OS to open URLs in the default browser.
    shell.openExternal(url);
    return { action: 'deny' }; // Prevent Electron from creating a new window
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- Auto Update ---

async function checkForUpdates () {
  try {
    const result = await autoUpdater.checkForUpdates()
    if (result && result.updateInfo.version === app.getVersion()) {
      sendStatusToWindow('You are using the latest version of PomoTrack! (' + app.getVersion() + ')')
    }
  } catch (error) {
    sendStatusToWindow('An error occurred while checking for updates.')
    log.error(error)
  }
}

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.')
  log.info(info)
})

autoUpdater.on('update-available', (info) => {
  log.info(info)
  const result = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Download', 'Later'],
    defaultId: 0,
    cancelId: 1,
    title: 'Update Available',
    message: 'Update for PomoTrack is available. Would you like to download it now?',
    detail: 'Version ' + info.version
  })
  if (result === 0) {
    log.info('autoUpdater.downloadUpdate...')
    autoUpdater.downloadUpdate()
  }
})

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  log.info(logMessage)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info(info)
  const result = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Install & Restart', 'Later'],
    defaultId: 0,
    cancelId: 1,
    title: 'Update Ready',
    message: 'The update has been downloaded. Do you want to install it now?'
  })

  if (result === 0) {
    log.info('autoUpdater.quitAndInstall...')
    autoUpdater.quitAndInstall()
  }
})

// --- App Lifecycle Events ---

// Ensure only a single instance of the app runs
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}


app.whenReady().then(() => {
  const appDataPath = app.getPath('appData');
  log.info('App Data Path:', appDataPath);
  log.info('App is ready.');

  // Handle the checkForUpdates IPC call from renderer
  ipcMain.handle('checkForUpdates', checkForUpdates);

  // No custom protocol needed as we use loadFile
  // protocol.registerFileProtocol(...) or protocol.handle(...) is removed

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
       log.info('Activate event: No windows open, creating one.');
       createWindow();
    } else {
       log.info('Activate event: Window already open, focusing.');
       if(mainWindow) mainWindow.focus();
    }
  });
});

app.on('window-all-closed', function () {
  log.info('All windows closed.');
  // Quit when all windows are closed, except on macOS.
  if (process.platform !== 'darwin') {
    log.info('Quitting app (not macOS).');
    app.quit();
  } else {
    log.info('Not quitting app (macOS behavior).');
  }
});

// Simplified clean exit handling
if (isDevelopment && process.platform === 'win32') {
  // Handle IPC message for graceful exit on Windows development
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      log.info('Received graceful-exit message, quitting.');
      app.quit();
    }
  });
} else {
  // Handle standard termination signals for non-Windows dev and all production
  const handleSignal = (signal) => {
    log.info(`Received ${signal}, quitting.`);
    app.quit();
  };

  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
}
