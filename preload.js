// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Example: Expose node modules securely
// const { contextBridge, ipcRenderer } = require('electron')

// contextBridge.exposeInMainWorld('electronAPI', {
//   // Example function to send data to the main process
//   send: (channel, data) => ipcRenderer.send(channel, data),
//   // Example function to receive data from the main process
//   on: (channel, func) => {
//     // Deliberately strip event sender context to prevent Electron API leaks
//     ipcRenderer.on(channel, (event, ...args) => func(...args));
//   }
// })

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: (callback) => ipcRenderer.on('message', (event, message) => callback(message)),
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates')
})
