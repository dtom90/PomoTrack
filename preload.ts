import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'

export interface ElectronAPI {
  onMessage: (callback: (message: unknown) => void) => void;
  checkForUpdates: () => Promise<unknown>;
}

const api: ElectronAPI = {
  onMessage: (callback: (message: unknown) => void) => {
    const subscription = (_event: IpcRendererEvent, message: unknown) => callback(message);
    ipcRenderer.on('message', subscription);
    // return () => ipcRenderer.removeListener('message', subscription);
  },
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates')
}

contextBridge.exposeInMainWorld('electronAPI', api)
