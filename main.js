const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');
const rpc = require('discord-rpc');
const { registerShortcuts, unregisterShortcuts } = require('./src/resources/extensions/keyboard');  // Importar las funciones del archivo keyboard.js

let mainWindow;
let loadingWindow;

// Discord Rich Presence
const clientId = 'CLIENTE DE TU APLICACION';
const rpcClient = new rpc.Client({ transport: 'ipc' });

// Título fijo de la notificación
const notificationTitle = 'NakamaStream Desktop';

// Función para mostrar una notificación del sistema
function showNotification(body, icon = null) {
    if (Notification.isSupported()) {
        const notificationOptions = {
            title: notificationTitle,  // Usamos el título fijo
            body: body,
            silent: false,
        };

        if (icon) {
            notificationOptions.icon = icon;
        }

        const notification = new Notification(notificationOptions);
        notification.show();
    } else {
        console.log('Notificaciones no soportadas en este sistema.');
    }
}

// Función para iniciar Discord RPC
function initializeDiscordRPC() {
    rpcClient.on('ready', () => {
        console.log('Discord RPC conectado.');
        showNotification('Tu estado se está compartiendo en Discord.', path.join(__dirname, 'src/resources/img/NakamaStreamIcon.png'));

        rpcClient.setActivity({
            details: 'Explorando la aplicación',
            state: 'En el inicio de sesión',
            startTimestamp: new Date(),
            largeImageKey: 'logo',
            largeImageText: 'NakamaStream',
        });
    });

    rpcClient.on('disconnected', () => {
        console.log('Discord no está abierto o se desconectó.');
        showNotification('Rich Presence está inactivo.', path.join(__dirname, 'src/resources/img/NakamaStreamIcon.png'));
    });

    rpcClient.login({ clientId }).catch((err) => {
        console.error('Error al conectar Discord RPC:', err.message);
        showNotification('No se pudo conectar a Discord.', path.join(__dirname, 'src/resources/img/NakamaStreamIcon.png'));
    });
}

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
            partition: 'persist:myAppCache',
            cache: true,
        },
        resizable: false,
        scrollBounce: false,
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
            partition: 'persist:myAppCache',
            cache: true,
            webSecurity: true,
        },
        autoHideMenuBar: true,
        frame: true,
        resizable: true,
        minimizable: true,
        maximizable: true,
        closable: true,
    });
    
    mainWindow.loadURL('https://nakamastream.lat/login');

    mainWindow.webContents.on('did-finish-load', () => {
        try {
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.close();
            }

            if (rpcClient && rpcClient.transport.socket) {
                rpcClient.setActivity({
                    details: 'Navegando por la aplicación',
                    state: 'En la página principal',
                    startTimestamp: new Date(),
                    largeImageKey: 'logo',
                    largeImageText: 'NakamaStream',
                });
            }
        } catch (error) {
            console.error('Error al cerrar la ventana de carga:', error);
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

    // Crear la ventana principal
    createMainWindow();

    // Registrar atajos de teclado
    registerShortcuts(mainWindow);

    // Iniciar Discord Rich Presence
    initializeDiscordRPC();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        unregisterShortcuts();  // Desregistrar los atajos de teclado
        if (rpcClient) {
            rpcClient.destroy();
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
