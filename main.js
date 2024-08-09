const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

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
        icon: path.join(__dirname, 'src/ext/img/NakamStream.png')  // Cambia esta ruta al archivo de icono que desees usar
    });

    mainWindow.maximize();

    mainWindow.loadFile(path.join(__dirname, 'src/public/html/loading.html'));

    setTimeout(() => {
        mainWindow.loadFile(path.join(__dirname, 'src/public/html/NakamaStream.html'));
    }, 6000);

    ipcMain.handle('get-cookies', async () => {
        try {
            const cookies = await ses.cookies.get({});
            return cookies;
        } catch (error) {
            console.error("Error al obtener las cookies:", error);
            return [];
        }
    });
}

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