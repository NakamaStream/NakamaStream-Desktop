const { app, BrowserWindow, globalShortcut, Notification } = require('electron');
const path = require('path');
const rpc = require('discord-rpc');

let mainWindow;
let loadingWindow;

// Discord Rich Presence
const clientId = 'CLIENTE DE TU APLICACION';
const rpcClient = new rpc.Client({ transport: 'ipc' });

// Función para mostrar una notificación del sistema
function showNotification(title, body) {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title,
            body: body,
            silent: false,
        });
        notification.show();
    } else {
        console.log('Notificaciones no soportadas en este sistema.');
    }
}

// Función para iniciar Discord Rich Presence
function initializeDiscordRPC() {
    rpcClient.on('ready', () => {
        console.log('Discord RPC conectado.');
        showNotification('Conectado a Discord', 'Tu estado se está compartiendo en Discord.');

        // Configurar estado inicial
        rpcClient.setActivity({
            details: 'Explorando la aplicación',
            state: 'En el inicio de sesión',
            startTimestamp: new Date(),
            largeImageKey: 'logo', // Asegúrate de tener esta imagen configurada en Discord Developer
            largeImageText: 'NakamaStream',
        });
    });

    rpcClient.on('disconnected', () => {
        console.log('Discord no está abierto o se desconectó.');
        showNotification('Discord no está abierto', 'Rich Presence está inactivo.');
    });

    rpcClient.login({ clientId }).catch((err) => {
        console.error('Error al conectar Discord RPC:', err.message);
        showNotification('Error con Discord RPC', 'No se pudo conectar a Discord.');
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

    // Escucha el evento did-finish-load para cerrar la ventana de carga
    mainWindow.webContents.on('did-finish-load', () => {
        try {
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.close();
            }

            // Actualizar el estado de Discord RPC
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

// Función para registrar el atajo F5
function registerShortcuts() {
    globalShortcut.register('F5', () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });
}

// Cuando la aplicación esté lista
app.on('ready', () => {
    // Crear ventana de carga
    createLoadingWindow();

    // Luego crear la ventana principal
    createMainWindow();

    // Registrar atajo F5
    registerShortcuts();

    // Iniciar Discord Rich Presence
    initializeDiscordRPC();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        globalShortcut.unregisterAll();
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
