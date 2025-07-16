import { shell, BrowserWindow, app, ipcMain, screen } from 'electron'
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

let deepLinkUrl: string | null = null
const gotTheLock = app.requestSingleInstanceLock()
let mainWindow: BrowserWindow | null = null

function handleDeepLink(deepLink: string): void {
  if (mainWindow) {
    try {
      const url = new URL(deepLink);
      const code = url.searchParams.get('code');
      if (code) {
        console.log('🔑 GitHub OAuth Code received:', code);
        exchangeCodeForToken(code).then(token => {
          console.log("✅ Token received:", token);
          store.set('access_token', token); // Save token
          mainWindow?.webContents.send('auth-success', token); // Notify renderer
        }).catch(err => {
          console.error("❌ Token exchange failed:", err);
        });
      }
    } catch (err) {
      console.error('❌ Invalid deep link URL:', deepLink, err);
    }
  }
}

if (process.platform === 'win32') {
  console.log("process.argv", process.argv)
  const deeplink = process.argv.find(arg => arg.toLowerCase().startsWith('gitwidget://'))
  console.log("deeplink", deeplink)
  if (deeplink) {
    deepLinkUrl = deeplink
    console.log("deepLinkUrl", deepLinkUrl)
  }
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch('http://localhost:4000/api/github/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error(data.error || 'Token exchange failed');
  }

  return data.token
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    // This happens on Windows when gitWidget://auth?code=XYZ is triggered
    if (process.platform === 'win32') {
      const deeplink = argv.find(arg => arg.toLowerCase().startsWith('gitwidget://'));
      if (deeplink) {
        console.log('💡 Deep link received in second instance:', deeplink);
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          handleDeepLink(deeplink);
        }
      }
    }
  })
}

function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: 350,
    height: 130,
    show: false,
    maxWidth: 820,
    maxHeight: 130,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: true,
    skipTaskbar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // sandbox: true
    }
  })

  // if (is.dev) {
  //   mainWindow.webContents.openDevTools({ mode: 'detach' });
  // }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
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
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(async () => {
  console.log("app ready here")

  mainWindow = createWindow()

  mainWindow?.webContents.on('did-finish-load', async () => {
    console.log('✅ Renderer loaded successfully')

    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl);
    }
  })
})


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

ipcMain.handle('logout', () => {
  console.log('[main] logout called');
  store.delete('access_token');
  if (mainWindow) {
    mainWindow.webContents.send('logged-out');
  }
});