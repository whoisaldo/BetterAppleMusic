import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

// Typed channel allow-lists – nothing else can leak through
const INVOKE_CHANNELS = [
  'window:minimize',
  'window:maximize',
  'window:close',
  'window:is-maximized',
  'window:is-full-screen',
  'window:set-title',
  'theme:get',
  'theme:set',
  'shell:open-external',
  'app:version',
  'app:path',
  'dialog:open-file',
  'updater:check',
  'updater:install',
] as const;

const LISTEN_CHANNELS = [
  'window:state-changed',
  'media:toggle-play',
  'media:next',
  'media:previous',
  'media:stop',
  'media:volume-up',
  'media:volume-down',
  'updater:update-available',
  'updater:up-to-date',
  'updater:download-progress',
  'updater:update-downloaded',
  'updater:error',
] as const;

type InvokeChannel = (typeof INVOKE_CHANNELS)[number];
type ListenChannel = (typeof LISTEN_CHANNELS)[number];

function isValidInvoke(channel: string): channel is InvokeChannel {
  return (INVOKE_CHANNELS as readonly string[]).includes(channel);
}

function isValidListen(channel: string): channel is ListenChannel {
  return (LISTEN_CHANNELS as readonly string[]).includes(channel);
}

const electronAPI = {
  // ---- Window controls ----
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized') as Promise<boolean>,
  isFullScreen: () => ipcRenderer.invoke('window:is-full-screen') as Promise<boolean>,
  setTitle: (title: string) => ipcRenderer.invoke('window:set-title', title),

  // ---- Theme ----
  getTheme: () => ipcRenderer.invoke('theme:get') as Promise<'dark' | 'light'>,
  setTheme: (mode: 'system' | 'dark' | 'light') => ipcRenderer.invoke('theme:set', mode),

  // ---- Shell ----
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  // ---- App info ----
  getVersion: () => ipcRenderer.invoke('app:version') as Promise<string>,
  getPath: (name: string) => ipcRenderer.invoke('app:path', name) as Promise<string | null>,

  // ---- Dialog ----
  openFile: (options?: Record<string, unknown>) =>
    ipcRenderer.invoke('dialog:open-file', options) as Promise<string[] | null>,

  // ---- Auto-update ----
  checkForUpdate: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),

  // ---- Generic safe IPC ----
  invoke: (channel: string, ...args: unknown[]) => {
    if (isValidInvoke(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`IPC invoke blocked: "${channel}" is not an allowed channel`);
  },

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!isValidListen(channel)) {
      throw new Error(`IPC listen blocked: "${channel}" is not an allowed channel`);
    }
    const handler = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  once: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!isValidListen(channel)) {
      throw new Error(`IPC listen blocked: "${channel}" is not an allowed channel`);
    }
    ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args),
    );
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
