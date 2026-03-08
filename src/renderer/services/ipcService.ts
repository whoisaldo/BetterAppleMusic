export const ipcService = {
  minimize: () => window.electronAPI?.minimize(),
  maximize: () => window.electronAPI?.maximize(),
  close: () => window.electronAPI?.close(),
};
