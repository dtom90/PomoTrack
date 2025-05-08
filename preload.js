// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

const api = {
  onMessage: (callback) => {
    const subscription = (_event, message) => callback(message);
    ipcRenderer.on('message', subscription);
    // return () => ipcRenderer.removeListener('message', subscription);
  },
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates')
}

contextBridge.exposeInMainWorld('electronAPI', api)
