// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app, BrowserWindow } = require('electron')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')

// Define isDev based on ELECTRON_IS_DEV environment variable set by electron-builder
const isDev = process.env.ELECTRON_IS_DEV === 'true';

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') // Optional: for secure IPC
    }
  })

  // Load the index.html of the app.
  if (isDev) {
    // In development, load the Vite dev server URL
    mainWindow.loadURL('http://localhost:5173')
    // Optional: Open DevTools automatically in development
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built index.html file
    mainWindow.loadFile(path.join(__dirname, 'dist_web/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Ensure the app quits properly on exit signal
process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());
