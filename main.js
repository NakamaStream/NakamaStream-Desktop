const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');
const rpc = require('discord-rpc');
const { registerShortcuts, unregisterShortcuts } = require('./src/resources/extensions/keyboard');  // Importar las funciones del archivo keyboard.js
const { createContextMenu } = require('./src/resources/extensions/contextMenu');  // Importar la función para el menú contextual

let mainWindow;
let loadingWindow;

// Discord Rich Presence
const _0x3f2a=['Client','ipc'];const clientId=Buffer.from('MTI4NzMwNDQ0ODU0ODQwOTM3NA==','base64').toString();const rpcClient=new rpc[_0x3f2a[0x0]]({transport:_0x3f2a[0x1]});

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

        updateDiscordActivity('Iniciando sesión');
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

// Función para actualizar la actividad de Discord
function updateDiscordActivity(pageTitle) {
    if (rpcClient && rpcClient.transport.socket) {
        rpcClient.setActivity({
            details: 'Navegando por la aplicación',
            state: `En: ${pageTitle}`,
            startTimestamp: new Date(),
            largeImageKey: 'logo',
            largeImageText: 'NakamaStream',
        });
    }
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

    // Configurar el menú contextual para el webview
    mainWindow.webContents.on('context-menu', (e, params) => {
        const contextMenu = createContextMenu(mainWindow);  // Usar la función importada
        contextMenu.popup({ window: mainWindow });
    });

    mainWindow.webContents.on('did-finish-load', () => {
        try {
            if (loadingWindow && !loadingWindow.isDestroyed()) {
                loadingWindow.close();
            }

            mainWindow.webContents.executeJavaScript('document.title').then(title => {
                updateDiscordActivity(title);
            });
        } catch (error) {
            console.error('Error al cerrar la ventana de carga:', error);
        }
    });

    mainWindow.webContents.on('page-title-updated', (event, title) => {
        updateDiscordActivity(title);
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
