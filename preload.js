// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCookies: () => ipcRenderer.invoke('get-cookies'),
  setCookie: (cookie) => ipcRenderer.invoke('set-cookie', cookie),
});

// Exponer ipcRenderer para el uso en el HTML
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
