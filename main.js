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

async function checkForUpdates() {
  log.info('checkForUpdates function called via IPC');
  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo) {
       log.info('Update check result:', result.updateInfo);
       // Additional logic based on result.updateInfo can go here
       // The 'update-available' or 'update-not-available' events will handle user feedback
    } else {
      log.info('No update check result received or no update info present.');
      // Optionally send a status if nothing obvious happened
      // sendStatusToWindow('No update information received.');
    }
  } catch (error) {
    log.error('Error during explicit update check:', error);
    sendStatusToWindow(`Error checking for updates: ${error.message}`);
  }
}

// --- Auto Updater Event Listeners (from old script) ---

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available.', info);
  sendStatusToWindow(`Update available: v${info.version}. Prompting user...`);
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `A new version (v${info.version}) of PomoTrack is available.`,
    detail: 'Do you want to download it now?',
    buttons: ['Download', 'Later'],
    defaultId: 0, // Default to Download
    cancelId: 1 // If they close the dialog, it's like clicking Later
  }).then(({ response }) => {
    if (response === 0) {
      log.info('User chose to download update.');
      sendStatusToWindow('Downloading update...');
      autoUpdater.downloadUpdate();
    } else {
       log.info('User chose not to download update yet.');
       sendStatusToWindow('Update download deferred.');
    }
  });
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  sendStatusToWindow(`Error in auto-updater: ${err.message || err}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  log.info(logMessage);
  // Optional: send progress to window if you have UI for it
  // mainWindow.webContents.send('download-progress', progressObj.percent);
  sendStatusToWindow(`Downloading update: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded.', info);
  sendStatusToWindow(`Update v${info.version} downloaded. Prompting user to install...`);
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: `Update v${info.version} has been downloaded.`,
    detail: 'Restart the application to apply the update?',
    buttons: ['Restart Now', 'Later'],
    defaultId: 0, // Default to Restart
    cancelId: 1
  }).then(({ response }) => {
    if (response === 0) {
      log.info('User chose to quit and install.');
      sendStatusToWindow('Restarting to install update...');
      // Ensure app quits cleanly before installing
      setImmediate(() => {
         app.removeAllListeners("window-all-closed") // Prevent loop
         if (mainWindow) {
            mainWindow.close(); // Close the window first
         }
         autoUpdater.quitAndInstall();
      })
    } else {
      log.info('User chose to install update later.');
      sendStatusToWindow('Update installation deferred.');
    }
  });
});

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

// Exit cleanly on request from parent process in development mode (from old script).
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        log.info('Received graceful-exit message, quitting.');
        app.quit();
      }
    });
  } else {
    // Keep original SIGTERM handler for non-Windows dev environments
    process.on('SIGTERM', () => {
      log.info('Received SIGTERM, quitting.');
      app.quit();
    });
     process.on('SIGINT', () => {
      log.info('Received SIGINT, quitting.');
      app.quit();
    });
  }
} else {
   // Ensure app quits properly on termination signals in production too
   process.on('SIGTERM', () => {
    log.info('Received SIGTERM (production), quitting.');
    app.quit();
  });
   process.on('SIGINT', () => {
    log.info('Received SIGINT (production), quitting.');
    app.quit();
  });
}
