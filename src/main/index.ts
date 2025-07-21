import { shell, BrowserWindow, app, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'
import path from 'path'
import { autoUpdater } from 'electron-updater'

const store = new Store();

// Auto-updater configuration - will be initialized after app is ready

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('📦 Update available:', info.version);
  // Notify renderer process about available update
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  console.error('❌ Error in auto-updater:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`📥 Download progress: ${Math.round(progress.percent)}%`);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progress);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
  // Auto-install after 5 seconds
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 5000);
});

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
        console.log('🔑 GitHub OAuth Code received');
        exchangeCodeForToken(code).then(token => {
          console.log("✅ Token received");
          store.set('access_token', token); // Save token
          
          // Show and focus the widget window
          mainWindow?.show();
          mainWindow?.focus();
          mainWindow?.setAlwaysOnTop(true);
          
          // Notify renderer about successful authentication
          mainWindow?.webContents.send('auth-success', token);
          
          // Reset always on top after a short delay
          setTimeout(() => {
            mainWindow?.setAlwaysOnTop(false);
          }, 2000);
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
  const res = await fetch('https://gitwidget-auth.onrender.com/api/github/exchange', {
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
  app.on('second-instance', (_event, argv) => {
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
  mainWindow = new BrowserWindow({
    width: 216,
    height: 160,
    minHeight: 160,
    minWidth: 216,
    maxWidth: 216,
    maxHeight: 160,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    roundedCorners: true,
    frame: false,
    alwaysOnTop: false,
    focusable: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    skipTaskbar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // sandbox: true
    }
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(false);

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
  
  mainWindow.webContents.on('did-fail-load', (_event, code, desc) => {
    console.error('❌ Renderer failed to load:', code, desc)
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(async () => {
  console.log("app ready here")

  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('chrome_100_percent.pak') ||
        message.includes('Unable to move the cache') ||
        message.includes('Unable to create cache') ||
        message.includes('Gpu Cache Creation failed')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }

  mainWindow = createWindow()

  if (!process.env['ELECTRON_RENDERER_URL']) {
    autoUpdater.checkForUpdatesAndNotify();
  }

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

ipcMain.on('open-github-auth', () => {
  shell.openExternal(
    'https://github.com/login/oauth/authorize?client_id=Ov23liqbrmV9VGJ7Y5AQ&redirect_uri=gitWidget://auth&scope=read:user'
  );
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', () => {
  console.log('[main] Manual update check requested');
  return autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('install-update', () => {
  console.log('[main] Update installation requested');
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
  console.log('[main] App version requested');
  return app.getVersion();
});