// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

const api = {
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates'),
  onMessage: (callback) => {
    const subscription = (_event, message) => callback(message);
    ipcRenderer.on('message', subscription);
    // return () => ipcRenderer.removeListener('message', subscription);
  },
  onDiskSpaceStatus: (callback) => {
    const subscription = (_event, message) => callback(message);
    ipcRenderer.on('disk-space-status', subscription);
    // return () => ipcRenderer.removeListener('message', subscription);
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)
