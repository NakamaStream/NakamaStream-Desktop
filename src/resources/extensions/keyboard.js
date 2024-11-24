const { globalShortcut } = require('electron');

function registerShortcuts(mainWindow) {
    // Atajo para recargar la ventana con F5
    globalShortcut.register('F5', () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });

    // Minimizar la ventana con Ctrl+M
    globalShortcut.register('Ctrl+M', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    // Acercar la ventana con Ctrl+ (o Ctrl+=)
    globalShortcut.register('Ctrl+=', () => {
        if (mainWindow) {
            let currentZoom = mainWindow.webContents.getZoomFactor();
            mainWindow.webContents.setZoomFactor(currentZoom + 0.1); // Incrementa el zoom
        }
    });

    // Alejar la ventana con Ctrl- (o Ctrl+-)
    globalShortcut.register('Ctrl+-', () => {
        if (mainWindow) {
            let currentZoom = mainWindow.webContents.getZoomFactor();
            mainWindow.webContents.setZoomFactor(currentZoom - 0.1); // Decrementa el zoom
        }
    });
}

function unregisterShortcuts() {
    // Desregistrar todos los atajos de teclado cuando la aplicación se cierre
    globalShortcut.unregisterAll();
}

module.exports = { registerShortcuts, unregisterShortcuts };
