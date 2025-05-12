/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell, ipcMain, dialog, Menu } = require('electron') // Added Menu
const path = require('path')
const { autoUpdater } = process.mas ? { autoUpdater: null } : require('electron-updater')
const log = require('electron-log')
const checkDiskSpace = require('check-disk-space').default;

if (autoUpdater) {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
  autoUpdater.autoDownload = false; // We will prompt the user
}

const isDevelopment = process.env.NODE_ENV === 'development'

if (isDevelopment) {
  app.setName('Pomodash Dev')
}
const appName = app.getName();
log.info(`App name: ${appName}`);
log.info('App starting...');

let mainWindow;
app.isQuitting = false; // Flag to differentiate between window close and app quit

function sendStatusToWindow(text) {
  log.info(text);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('message', text);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173');
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'dist_web/index.html')
    mainWindow.loadFile(indexPath).then(() => {
      if (autoUpdater) {
        log.info('Checking for updates after loading production build...');
        autoUpdater.checkForUpdates();
      }
    }).catch(err => {
      log.error('Failed to load production index.html:', err)
      dialog.showErrorBox('Load Error', `Failed to load application file: ${indexPath}\n${err.message}`)
    })
  }

  diskSpaceMonitor(mainWindow)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // --- Modified for macOS close behavior ---
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      log.info('Window close intercepted on macOS; hiding window instead of quitting.');
      event.preventDefault();
      mainWindow.hide();
    }
    // On other platforms or if app.isQuitting is true, the default close will occur,
    // which will eventually lead to the 'closed' event.
  });

  mainWindow.on('closed', () => {
    log.info('Main window instance closed.');
    mainWindow = null;
  });
}

// --- Auto Update --- (Your existing auto-update code remains unchanged)
async function checkForUpdates () {
  if (!autoUpdater) return;

  try {
    const result = await autoUpdater.checkForUpdates()
    if (result && result.updateInfo.version === app.getVersion()) {
      sendStatusToWindow('You are using the latest version of Pomodash! (' + app.getVersion() + ')')
    }
  } catch (error) {
    sendStatusToWindow('An error occurred while checking for updates.')
    log.error(error)
  }
}

if (autoUpdater) {
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
      message: 'Update for Pomodash is available. Would you like to download it now?',
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
}
// --- End of Auto Update ---


// --- Disk Space Monitor --- (Your existing disk space monitor code remains unchanged)
const LOW_SPACE_THRESHOLD = 2; // 2 GB

function diskSpaceMonitor(mainWindowInstance) { // Renamed parameter to avoid conflict with global mainWindow

  const checkDiskSpaceAndSignal = async () => {
    try {
      const diskPath = process.platform === 'win32' ? 'C:' : '/';
      const diskSpace = await checkDiskSpace(diskPath);

      const freeSpaceGB = diskSpace.free / (1024 * 1024 * 1024);
      const totalSpaceGB = diskSpace.size / (1024 * 1024 * 1024);
      const freePercentage = (diskSpace.free / diskSpace.size) * 100;

      if (freeSpaceGB < LOW_SPACE_THRESHOLD) {
        const data = {
          isLow: true,
          free: freeSpaceGB.toFixed(2),
          total: totalSpaceGB.toFixed(2),
          percentage: freePercentage.toFixed(2),
          path: diskSpace.diskPath,
        }
        log.error('Low disk space detected!', data);
        if (mainWindowInstance && mainWindowInstance.webContents) {
          mainWindowInstance.webContents.send('disk-space-status', data);
        }
      } else {
        log.info('Disk space is OK.')
        if (mainWindowInstance && mainWindowInstance.webContents) {
          mainWindowInstance.webContents.send('disk-space-status', {
            isLow: false,
            free: freeSpaceGB.toFixed(2),
            total: totalSpaceGB.toFixed(2),
            percentage: freePercentage.toFixed(2),
            path: diskSpace.diskPath,
          });
        }
      }
    } catch (error) {
      log.error('Failed to check disk space:', error);
      if (mainWindowInstance && mainWindowInstance.webContents) {
        mainWindowInstance.webContents.send('disk-space-status', {
          error: 'Failed to retrieve disk space information.',
        });
      }
    }
  }

  async function checkDiskSpaceAndSignalRunner() {
    for (let i = 0; i < 10; i++) {
      await checkDiskSpaceAndSignal();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setInterval(checkDiskSpaceAndSignal, 10000);
  }

  checkDiskSpaceAndSignalRunner().then(() => {
    log.info('Disk space monitor started.');
  }).catch(error => {
    log.error('Failed to start disk space monitor:', error);
  });
}
// --- End of Disk Space Monitor ---


// --- App Lifecycle Events ---

// Ensure only a single instance of the app runs
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  log.info('Another instance is already running.')
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      if (!mainWindow.isVisible()) mainWindow.show(); // Show if hidden
      mainWindow.focus()
    }
  })
}

// --- Added for macOS quit behavior ---
app.on('before-quit', () => {
  log.info('Before quit event triggered, setting app.isQuitting to true.');
  app.isQuitting = true;
});


app.whenReady().then(() => {
  const appDataPath = app.getPath('appData');
  log.info('App Data Path:', appDataPath);
  log.info('App is ready.');

  ipcMain.handle('checkForUpdates', checkForUpdates);

  // Create the application menu
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Main Window',
          click: () => {
            if (mainWindow) {
              if (mainWindow.isMinimized()) mainWindow.restore();
              if (!mainWindow.isVisible()) mainWindow.show();
              mainWindow.focus();
            } else {
              createWindow();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Minimize',
          click: () => {
            if (mainWindow) {
              mainWindow.minimize();
            }
          },
          accelerator: 'CmdOrCtrl+M'
        },
        {
          type: 'separator'
        },
        {
          role: 'front',
          label: 'Bring All to Front'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://home.pomotrack.app/')
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();

  // --- Setup Dock Menu for macOS ---
  if (process.platform === 'darwin') {
    log.info('Setting up Dock menu for macOS.');
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Main Window',
        click: () => {
          if (mainWindow) {
            if (!mainWindow.isVisible()) {
              mainWindow.show();
            }
            mainWindow.focus();
          } else {
            createWindow(); // Create a new window if none exists
          }
        }
      },
      // You can add other common Dock menu items here
      // e.g., { label: 'New Window', click: () => { /* create another window */ } },
      // { type: 'separator' },
      // { label: 'Settings...', click: () => { /* open settings */ } }
    ]);
    app.dock.setMenu(dockMenu);
  }

  // --- Modified for macOS activate behavior ---
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      log.info('Activate event: No windows open, creating one.');
      createWindow();
    } else if (mainWindow) {
        log.info('Activate event: Main window exists.');
        if (!mainWindow.isVisible()) {
            log.info('Main window is hidden, showing and focusing.');
            mainWindow.show();
        }
        mainWindow.focus();
    }
  });
});

app.on('window-all-closed', function () {
  log.info('All windows closed.');
  if (process.platform !== 'darwin') {
    log.info('Quitting app (not macOS).');
    app.quit();
  } else {
    log.info('Not quitting app (macOS behavior - app will stay active).');
    // On macOS, the app should remain active until explicitly quit.
    // The Dock menu will still be available.
  }
});

// Your existing signal handling code
if (isDevelopment && process.platform === 'win32') {
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      log.info('Received graceful-exit message, quitting.');
      app.quit();
    }
  });
} else {
  const handleSignal = (signal) => {
    log.info(`Received ${signal}, quitting.`);
    app.quit(); // This will trigger 'before-quit'
  };

  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
}
