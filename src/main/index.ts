import { shell, BrowserWindow, app, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import path from 'path'

const store = new Store();

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('gitWidget', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('gitWidget')
}

let deepLinkUrl: string | null = null;

if (process.platform === 'win32') {
  const deeplink = process.argv.find(arg => arg.startsWith('gitWidget://'))
  if (deeplink) {
    deepLinkUrl = deeplink
  }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createWindow(): any {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Renderer loaded successfully')
  })
  
  mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
    console.error('❌ Renderer failed to load:', code, desc)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  if (deepLinkUrl) {
    const url = new URL(deepLinkUrl);
    const code = url.searchParams.get('code');

    if (code) {
      console.log('🔑 GitHub OAuth Code received:', code);

      // Call your backend or exchange function here
      // Then send it to renderer:
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('auth-success', code); // or token later
      });
    }
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('get-token', () => {
  console.log('[main] get-token called');
  return store.get('access_token') as string
})

ipcMain.handle('set-token', (_event, token: string) => {
  console.log('[main] set-token called');
  store.set('access_token', token)
})