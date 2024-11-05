const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let loadingWindow;

// Función para crear la ventana de carga
function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
        resizable: false,
    });

    loadingWindow.loadFile(path.join(__dirname, 'src/resources/html/loading.html'));
    loadingWindow.show();
}

// Función para crear la ventana principal
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
        autoHideMenuBar: true,
        frame: true,
        resizable: true,
        minimizable: true,
        maximizable: true,
        closable: true,
    });

    mainWindow.loadURL('https://nakamastream.lat/login');

    // Escucha el evento did-finish-load para cerrar la ventana de carga
    mainWindow.webContents.on('did-finish-load', () => {
        if (loadingWindow) {
            loadingWindow.close();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Cuando la aplicación esté lista
app.on('ready', () => {
    // Crear ventana de carga
    createLoadingWindow();
    // Luego crear la ventana principal
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
