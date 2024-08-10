const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;
let confirmWindow;

function createWindow() {
    const ses = session.fromPartition('persist:electron-webview-session');

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webviewTag: true,
            session: ses
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'src/ext/img/NakamStream.png')
    });

    mainWindow.maximize();

    mainWindow.loadFile(path.join(__dirname, 'src/public/html/loading.html'));

    ipcMain.handle('get-cookies', async () => {
        try {
            const cookies = await ses.cookies.get({});
            return cookies;
        } catch (error) {
            console.error("Error al obtener las cookies:", error);
            return [];
        }
    });

    mainWindow.on('close', (e) => {
        e.preventDefault();
        createConfirmWindow();
    });
}

function createConfirmWindow() {
    const [mainWindowX, mainWindowY] = mainWindow.getPosition();
    const [mainWindowWidth, mainWindowHeight] = mainWindow.getSize();

    const confirmWindowWidth = 400;
    const confirmWindowHeight = 200;

    const confirmWindowX = mainWindowX + Math.round((mainWindowWidth - confirmWindowWidth) / 2);
    const confirmWindowY = mainWindowY + Math.round((mainWindowHeight - confirmWindowHeight) / 2);

    confirmWindow = new BrowserWindow({
        width: confirmWindowWidth,
        height: confirmWindowHeight,
        x: confirmWindowX,
        y: confirmWindowY,
        frame: false,
        modal: true,
        parent: mainWindow,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    confirmWindow.loadFile(path.join(__dirname, 'src/public/html/confirm.html'));
    confirmWindow.setMenuBarVisibility(false);
    confirmWindow.setMinimumSize(confirmWindowWidth, confirmWindowHeight);
    confirmWindow.setMaximumSize(confirmWindowWidth, confirmWindowHeight);
}

ipcMain.on('cancel-close', () => {
    if (confirmWindow) {
        confirmWindow.close();
        confirmWindow = null;
    }
});

ipcMain.on('confirm-close', () => {
    if (confirmWindow) {
        confirmWindow.close();
        confirmWindow = null;
    }
    mainWindow.destroy();
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
