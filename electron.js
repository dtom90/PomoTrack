/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
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
const productName = app.getName();
log.info(`App name: ${productName}`);
log.info('App starting...');

let mainWindow;

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- Auto Update ---

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

// --- Disk Space Monitor ---

const LOW_SPACE_THRESHOLD = 2; // 2 GB

function diskSpaceMonitor(mainWindow) {

  const checkDiskSpaceAndSignal = async () => {
    try {
      // For Windows, check a specific drive like 'C:'
      // For macOS/Linux, check a path like '/' or app.getPath('userData')
      const diskPath = process.platform === 'win32' ? 'C:' : '/';
      const diskSpace = await checkDiskSpace(diskPath);

      // Define what you consider "low disk space"
      // For example, less than 10GB free or less than 5% free
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
        // Send information to the renderer process to display a warning
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('disk-space-status', data);
        }
      } else {
        log.info('Disk space is OK.')
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('disk-space-status', {
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
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('disk-space-status', {
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
    // Keep checking indefinitely at 10 second intervals
    setInterval(checkDiskSpaceAndSignal, 10000);
  }

  checkDiskSpaceAndSignalRunner().then(() => {
    log.info('Disk space monitor started.');
  }).catch(error => {
    log.error('Failed to start disk space monitor:', error);
  });
}

// --- App Lifecycle Events ---

// Ensure only a single instance of the app runs
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  log.info('Another instance is already running.')
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

  ipcMain.handle('checkForUpdates', checkForUpdates);

  createWindow();

  app.on('activate', function () {
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
  if (process.platform !== 'darwin') {
    log.info('Quitting app (not macOS).');
    app.quit();
  } else {
    log.info('Not quitting app (macOS behavior).');
  }
});

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
    app.quit();
  };

  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
}
