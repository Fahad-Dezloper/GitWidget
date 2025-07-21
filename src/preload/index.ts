/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  openExternal: (url: string) => shell.openExternal(url),
  openGitHubAuth: () => ipcRenderer.send('open-github-auth'),
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
  removeListener: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
  
  // Auto-updater specific methods
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
})
