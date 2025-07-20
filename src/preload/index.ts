import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Open a URL in the default browser
  openExternal: (url: string) => shell.openExternal(url),

  // Start GitHub OAuth
  openGitHubAuth: () =>
    shell.openExternal(
      'https://github.com/login/oauth/authorize?client_id=Ov23liqbrmV9VGJ7Y5AQ&redirect_uri=gitWidget://auth&scope=read:user'
    ),

  // IPC invoke (promise-based)
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),

  // Listen to events from main
  on: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => listener(...args)),

  // Remove listeners
  removeListener: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
})
