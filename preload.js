const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getCookies: () => ipcRenderer.invoke('get-cookies')
});