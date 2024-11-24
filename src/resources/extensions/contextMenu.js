const { Menu, MenuItem, BrowserWindow } = require('electron');
const path = require('path');

// Función para crear el menú contextual
function createContextMenu(mainWindow) {
    const contextMenu = new Menu();

    // Opción para recargar la página
    contextMenu.append(new MenuItem({
        label: 'Recargar Página',
        click: () => {
            mainWindow.webContents.reload();
        }
    }));

    // Opción para mostrar la información del teclado
    contextMenu.append(new MenuItem({
        label: 'Mostrar información del teclado',
        click: () => {
            // Crear una nueva ventana para mostrar la información
            const keyboardWindow = new BrowserWindow({
                width: 600,
                height: 400,
                webPreferences: {
                    nodeIntegration: true // Habilitar nodeIntegration si es necesario
                }
            });

            // Cargar un archivo HTML con la información del teclado
            // Usar path.join para construir la ruta absoluta
            const htmlPath = path.join(__dirname, '../html/keyboard-info.html'); // Ajusta según la estructura

            keyboardWindow.loadFile(htmlPath);

            // Opción para cerrar la ventana cuando se cierre
            keyboardWindow.on('closed', () => {
                keyboardWindow = null;
            });
        }
    }));

    // Mostrar el menú contextual
    return contextMenu;
}

module.exports = { createContextMenu };
