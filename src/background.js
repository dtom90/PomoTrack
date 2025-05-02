'use strict'

import { app, protocol, BrowserWindow, shell, ipcMain, dialog, net } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import { pathToFileURL } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

autoUpdater.autoDownload = false
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function sendStatusToWindow (text) {
  log.info(text)
  win.webContents.send('message', text)
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdates()
  }

  // Open links in the default browser window
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  win.on('closed', () => {
    win = null
  })
}

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

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   log.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  ipcMain.handle('checkForUpdates', checkForUpdates)

  // --- Add protocol handler ---
  protocol.handle('app', (request) => {
    // 1. Extract the path from the URL (e.g., 'index.html' or 'js/app.js')
    //    request.url will be like 'app://./index.html'
    //    +3 gets rid of '://', slice(1) gets rid of the leading '.'
    const urlPath = new URL(request.url).pathname.slice(1)

    // Check for directory traversal attempts
    const safePath = path.normalize(urlPath)
    if (safePath.startsWith('..') || path.isAbsolute(safePath)) {
      log.warn(`Blocked potentially unsafe path request: ${urlPath}`)
      return new Response('Bad Request', { status: 400 })
    }

    const filePath = path.join(__dirname, safePath) // __dirname points to app root in production

    // 2. Use net.fetch to load the local file
    //    pathToFileURL converts the system path to a file:// URL for fetch
    return net.fetch(pathToFileURL(filePath).toString())
      .catch((error) => {
        // Basic error handling for file not found etc.
        log.error(`Failed to fetch ${filePath}: ${error}`)
        return new Response('Not Found', { status: 404 })
      })
  })
  // --- End protocol handler ---

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
