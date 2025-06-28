const { contextBridge, ipcRenderer } = require('electron');

// Expose safe methods to the renderer process
contextBridge.exposeInMainWorld('api', {
    quitApp: () => ipcRenderer.send('quit-app'),
});

