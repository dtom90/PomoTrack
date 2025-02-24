
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: (callback) => ipcRenderer.on('message', (event, message) => callback(message)),
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates')
})
