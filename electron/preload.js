const { contextBridge, ipcRenderer } = require('electron');

/**
 * EQUILIBRIUM PRELOAD
 * Exposes a secure, typed bridge from renderer → main process.
 * All IPC calls are channeled through this API — no direct Node.js access from React.
 */
contextBridge.exposeInMainWorld('equilibrium', {
  // ── Activities ──────────────────────────────────────────────────────────────
  activities: {
    getAll:      ()       => ipcRenderer.invoke('activities:getAll'),
    create:      (data)   => ipcRenderer.invoke('activities:create', data),
    delete:      (id)     => ipcRenderer.invoke('activities:delete', id),
    getStats:    ()       => ipcRenderer.invoke('activities:getStats'),
    getInsights: ()       => ipcRenderer.invoke('activities:getInsights'),
  },

  // ── Reference Data ──────────────────────────────────────────────────────────
  zones:      { getAll: () => ipcRenderer.invoke('zones:getAll') },
  sentiments: { getAll: () => ipcRenderer.invoke('sentiments:getAll') },

  // ── Window Controls ─────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },
});
