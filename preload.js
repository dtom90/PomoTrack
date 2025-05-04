// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: (callback) => ipcRenderer.on('message', (event, message) => callback(message)),
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates')
})
