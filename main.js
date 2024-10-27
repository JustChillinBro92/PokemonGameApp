import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 576,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // Allows access to DOM APIs in renderer
        preload: path.join('preload.js') // Preload script
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


