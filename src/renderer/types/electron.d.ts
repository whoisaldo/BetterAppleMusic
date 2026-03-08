export interface ElectronAPI {
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  isFullScreen: () => Promise<boolean>;
  setTitle: (title: string) => Promise<void>;

  // Theme
  getTheme: () => Promise<'dark' | 'light'>;
  setTheme: (mode: 'system' | 'dark' | 'light') => Promise<void>;

  // Shell
  openExternal: (url: string) => Promise<void>;

  // App info
  getVersion: () => Promise<string>;
  getPath: (name: string) => Promise<string | null>;

  // Dialog
  openFile: (options?: Record<string, unknown>) => Promise<string[] | null>;

  // Auto-update
  checkForUpdate: () => Promise<unknown>;
  installUpdate: () => Promise<void>;

  // Generic IPC
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
