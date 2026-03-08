import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  dialog,
  globalShortcut,
  nativeTheme,
  Menu,
  Tray,
  type IpcMainInvokeEvent,
} from 'electron';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

// ---------------------------------------------------------------------------
// Single-instance lock – prevent duplicate windows
// ---------------------------------------------------------------------------

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// ---------------------------------------------------------------------------
// Window state persistence
// ---------------------------------------------------------------------------

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState(): WindowState {
  const defaults: WindowState = { width: 1200, height: 800, isMaximized: false };
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    /* corrupted file – fall through to defaults */
  }
  return defaults;
}

function saveWindowState(win: BrowserWindow): void {
  const bounds = win.getBounds();
  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: win.isMaximized(),
  };
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    /* best-effort – ignore write failures */
  }
}

// ---------------------------------------------------------------------------
// Window Manager
// ---------------------------------------------------------------------------

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function createMainWindow(): BrowserWindow {
  const state = loadWindowState();

  const win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 940,
    minHeight: 560,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 14 },
    backgroundColor: '#1C1C1E',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      webviewTag: false,
      devTools: isDev,
    },
  });

  if (state.isMaximized) {
    win.maximize();
  }

  // Graceful show – avoids white flash
  win.once('ready-to-show', () => {
    win.show();
    if (isDev) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Persist geometry on move / resize
  const persist = () => saveWindowState(win);
  win.on('resize', persist);
  win.on('move', persist);
  win.on('maximize', () => {
    win.webContents.send('window:state-changed', { isMaximized: true });
    persist();
  });
  win.on('unmaximize', () => {
    win.webContents.send('window:state-changed', { isMaximized: false });
    persist();
  });
  win.on('enter-full-screen', () => {
    win.webContents.send('window:state-changed', { isFullScreen: true });
  });
  win.on('leave-full-screen', () => {
    win.webContents.send('window:state-changed', { isFullScreen: false });
  });

  // On macOS, clicking the close button hides the window instead of quitting
  win.on('close', (e) => {
    if (isMac && !isQuitting) {
      e.preventDefault();
      win.hide();
    } else {
      saveWindowState(win);
    }
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  // Block new-window attempts (links open in external browser)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load the renderer
  if (isDev) {
    win.loadURL('http://localhost:9000');
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

// ---------------------------------------------------------------------------
// System Tray (Windows / Linux – macOS uses the dock)
// ---------------------------------------------------------------------------

function createTray(): void {
  if (isMac) return;

  // Use a simple 16x16 placeholder; swap for a real icon in production
  const iconPath = path.join(__dirname, '../renderer/favicon.ico');
  if (!fs.existsSync(iconPath)) return;

  tray = new Tray(iconPath);
  tray.setToolTip('Better Apple Music');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { type: 'separator' },
    {
      label: 'Play / Pause',
      click: () => mainWindow?.webContents.send('media:toggle-play'),
    },
    { label: 'Next', click: () => mainWindow?.webContents.send('media:next') },
    { label: 'Previous', click: () => mainWindow?.webContents.send('media:previous') },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

// ---------------------------------------------------------------------------
// Application Menu
// ---------------------------------------------------------------------------

function buildAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        ...(isDev ? [{ role: 'reload' as const }, { role: 'forceReload' as const }] : []),
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => mainWindow?.webContents.send('media:toggle-play'),
        },
        {
          label: 'Next Track',
          accelerator: 'CmdOrCtrl+Right',
          click: () => mainWindow?.webContents.send('media:next'),
        },
        {
          label: 'Previous Track',
          accelerator: 'CmdOrCtrl+Left',
          click: () => mainWindow?.webContents.send('media:previous'),
        },
        { type: 'separator' },
        {
          label: 'Volume Up',
          accelerator: 'CmdOrCtrl+Up',
          click: () => mainWindow?.webContents.send('media:volume-up'),
        },
        {
          label: 'Volume Down',
          accelerator: 'CmdOrCtrl+Down',
          click: () => mainWindow?.webContents.send('media:volume-down'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        ...(isMac ? [{ role: 'zoom' as const }] : [{ role: 'close' as const }]),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------------------------------------------------------------------------
// IPC Handlers
// ---------------------------------------------------------------------------

function registerIpcHandlers(): void {
  // ---- Window controls ----
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
  ipcMain.handle('window:is-full-screen', () => mainWindow?.isFullScreen() ?? false);

  ipcMain.handle('window:set-title', (_e: IpcMainInvokeEvent, title: string) => {
    mainWindow?.setTitle(title);
  });

  // ---- Theme ----
  ipcMain.handle('theme:get', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

  ipcMain.handle('theme:set', (_e: IpcMainInvokeEvent, mode: 'system' | 'dark' | 'light') => {
    nativeTheme.themeSource = mode;
  });

  // ---- Shell ----
  ipcMain.handle('shell:open-external', (_e: IpcMainInvokeEvent, url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
  });

  // ---- App info ----
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('app:path', (_e: IpcMainInvokeEvent, name: string) => {
    const allowed = ['userData', 'temp', 'downloads', 'music'] as const;
    type AllowedPath = (typeof allowed)[number];
    if (allowed.includes(name as AllowedPath)) {
      return app.getPath(name as AllowedPath);
    }
    return null;
  });

  // ---- Dialog ----
  ipcMain.handle(
    'dialog:open-file',
    async (_e: IpcMainInvokeEvent, options: Electron.OpenDialogOptions) => {
      if (!mainWindow) return null;
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result.canceled ? null : result.filePaths;
    },
  );

  // ---- Auto-update (wired up when electron-updater is installed) ----
  ipcMain.handle('updater:check', async () => {
    try {
      const { autoUpdater } = await import('electron-updater');
      return autoUpdater.checkForUpdates();
    } catch {
      return { available: false, reason: 'electron-updater not installed' };
    }
  });

  ipcMain.handle('updater:install', async () => {
    try {
      const { autoUpdater } = await import('electron-updater');
      autoUpdater.quitAndInstall(false, true);
    } catch {
      /* no-op */
    }
  });
}

// ---------------------------------------------------------------------------
// Security – CSP & permission policies
// ---------------------------------------------------------------------------

function hardenSession(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws://localhost:* http://localhost:* https://api.music.apple.com; img-src 'self' data: https:;"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.music.apple.com; img-src 'self' data: https:;",
        ],
      },
    });
  });

  // Deny all permission requests by default, whitelist as needed
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'mediaKeySystem'];
    callback(allowed.includes(permission));
  });
}

// ---------------------------------------------------------------------------
// Global Shortcuts (media keys when app is focused)
// ---------------------------------------------------------------------------

function registerGlobalShortcuts(): void {
  const shortcuts: Record<string, string> = {
    'MediaPlayPause': 'media:toggle-play',
    'MediaNextTrack': 'media:next',
    'MediaPreviousTrack': 'media:previous',
    'MediaStop': 'media:stop',
  };

  for (const [accelerator, channel] of Object.entries(shortcuts)) {
    globalShortcut.register(accelerator, () => {
      mainWindow?.webContents.send(channel);
    });
  }
}

// ---------------------------------------------------------------------------
// Auto-Update lifecycle hooks
// ---------------------------------------------------------------------------

async function initAutoUpdater(): Promise<void> {
  try {
    const { autoUpdater } = await import('electron-updater');

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('updater:update-available', info);
    });

    autoUpdater.on('update-not-available', () => {
      mainWindow?.webContents.send('updater:up-to-date');
    });

    autoUpdater.on('download-progress', (progress) => {
      mainWindow?.webContents.send('updater:download-progress', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('updater:update-downloaded', info);
    });

    autoUpdater.on('error', (err) => {
      mainWindow?.webContents.send('updater:error', err.message);
    });

    autoUpdater.checkForUpdates();
  } catch {
    // electron-updater not installed – skip silently in dev
  }
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    mainWindow = createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

app.whenReady().then(async () => {
  hardenSession();
  buildAppMenu();
  registerIpcHandlers();
  registerGlobalShortcuts();
  createTray();

  mainWindow = createMainWindow();

  if (!isDev) {
    await initAutoUpdater();
  }
});
