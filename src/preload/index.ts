import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { shell } from 'electron'

// Custom APIs for renderer
const api = {
  openExternal: (url: string) => shell.openExternal(url)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      openExternal: api.openExternal,
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
      openGitHubAuth: () => shell.openExternal(
        `https://github.com/login/oauth/authorize?client_id=Ov23liqbrmV9VGJ7Y5AQ&redirect_uri=gitWidget://auth&scope=read:user`
      ),
      on: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.on(channel, listener),
      removeListener: (channel: string, listener: (...args: any[]) => void) => ipcRenderer.removeListener(channel, listener),
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
