const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const axios = require('axios');

let mainWindow;
let loadingWindow;

// Define la versión actual aquí
let currentVersion = '1.0.0'; // Cambia esta línea para actualizar la versión actual

const GITHUB_API_URL = 'https://api.github.com/repos/NakamaStream/NakamaStream-Desktop/releases/latest';

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

// Función para verificar la conexión a Internet
function checkInternet(callback) {
    http.get('http://www.google.com', (res) => {
        callback(res.statusCode === 200);
    }).on('error', () => {
        callback(false);
    });
}

// Función para verificar actualizaciones
async function checkForUpdates() {
    try {
        const response = await axios.get(GITHUB_API_URL);
        const latestVersion = response.data.tag_name; // La versión en la etiqueta
        return latestVersion;
    } catch (error) {
        console.error('Error al verificar actualizaciones:', error);
        return null;
    }
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

// Escuchar el evento de actualización
ipcMain.on('start-update', (event) => {
    console.log('Iniciando el proceso de actualización...');
    app.relaunch(); // Ejemplo de relanzamiento de la aplicación
    app.exit(0); // Salir de la aplicación
});

app.on('ready', async () => {
    const isConnected = await new Promise((resolve) => checkInternet(resolve));
    if (isConnected) {
        const latestVersion = await checkForUpdates();

        if (latestVersion && latestVersion !== currentVersion) {
            // Si hay una actualización disponible, mostramos la ventana de actualización
            const updateWindow = new BrowserWindow({
                width: 800,
                height: 600,
                frame: false,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    contextIsolation: true,
                    enableRemoteModule: false,
                    nodeIntegration: false,
                },
                resizable: false,
            });

            updateWindow.loadFile(path.join(__dirname, 'src/resources/html/update.html'));
            updateWindow.webContents.on('did-finish-load', () => {
                updateWindow.webContents.send('update-available', latestVersion);
            });
        } else {
            // Si no hay actualizaciones disponibles, creamos la ventana de carga
            createLoadingWindow(); // Crear ventana de carga aquí
            createMainWindow(); // Luego crear la ventana principal
        }
    } else {
        // Si no hay conexión a Internet, mostramos la ventana de error
        const errorWindow = new BrowserWindow({
            width: 600,
            height: 400,
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false,
            },
            resizable: false,
        });

        errorWindow.loadFile(path.join(__dirname, 'src/resources/html/error.html'));
        errorWindow.show();
    }
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
