const { contextBridge, ipcRenderer } = require('electron');

/**
 * EQUILIBRIUM PRELOAD v1.3
 * Exposes a secure, typed bridge from renderer → main process.
 */
contextBridge.exposeInMainWorld('equilibrium', {
  activities: {
    getAll:      ()                     => ipcRenderer.invoke('activities:getAll'),
    create:      (data)                 => ipcRenderer.invoke('activities:create', data),
    delete:      (id)                   => ipcRenderer.invoke('activities:delete', id),
    complete:    (id, xpMultiplier)     => ipcRenderer.invoke('activities:complete', { id, xpMultiplier }),
    getMissions: ()                     => ipcRenderer.invoke('activities:getMissions'),
    getStats:    ()                     => ipcRenderer.invoke('activities:getStats'),
    getXP:       ()                     => ipcRenderer.invoke('activities:getXP'),
    getInsights: ()                     => ipcRenderer.invoke('activities:getInsights'),
  },
  zones:        { getAll: () => ipcRenderer.invoke('zones:getAll') },
  sentiments:   { getAll: () => ipcRenderer.invoke('sentiments:getAll') },
  achievements: {
    getAll:  ()    => ipcRenderer.invoke('achievements:getAll'),
    unlock:  (id)  => ipcRenderer.invoke('achievements:unlock', id),
  },
  habits: {
    getAll:    ()                    => ipcRenderer.invoke('habits:getAll'),
    create:    (data)                => ipcRenderer.invoke('habits:create', data),
    delete:    (id)                  => ipcRenderer.invoke('habits:delete', id),
    toggleLog: (habitId, periodKey)  => ipcRenderer.invoke('habits:toggleLog', { habitId, periodKey }),
  },
  projects: {
    getAll:        ()                          => ipcRenderer.invoke('projects:getAll'),
    create:        (data)                      => ipcRenderer.invoke('projects:create', data),
    delete:        (id)                        => ipcRenderer.invoke('projects:delete', id),
    complete:      (id)                        => ipcRenderer.invoke('projects:complete', id),
    reopen:        (id)                        => ipcRenderer.invoke('projects:reopen', id),
    addSubtask:    (projectId, title)          => ipcRenderer.invoke('projects:addSubtask', { projectId, title }),
    toggleSubtask: (subtaskId, completed, projectId) => ipcRenderer.invoke('projects:toggleSubtask', { subtaskId, completed, projectId }),
    deleteSubtask: (subtaskId, projectId)      => ipcRenderer.invoke('projects:deleteSubtask', { subtaskId, projectId }),
  },
  data: {
    export: ()        => ipcRenderer.invoke('data:export'),
    import: (payload) => ipcRenderer.invoke('data:import', payload),
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },
});
