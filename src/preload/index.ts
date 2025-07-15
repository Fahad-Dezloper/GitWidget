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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
      openGitHubAuth: () => shell.openExternal(
        `https://github.com/login/oauth/authorize?client_id=Ov23liqbrmV9VGJ7Y5AQ&redirect_uri=gitWidget://auth&scope=read:user`
      ),
      ipcRenderer: ipcRenderer
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
