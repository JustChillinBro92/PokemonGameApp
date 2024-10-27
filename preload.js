import { contextBridge, ipcRenderer } from 'electron';

// Expose safe methods to the renderer process
contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
});
