const { Menu, MenuItem, BrowserWindow } = require('electron');
const path = require('path');

let keyboardWindow = null; // Almacenamos la referencia de la ventana secundaria

// Función para crear el menú contextual
function createContextMenu(mainWindow) {
    const contextMenu = new Menu();

    // Opción para recargar la página
    contextMenu.append(new MenuItem({
        label: 'Reload App',
        click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.reload();
            }
        }
    }));

    // Opción para mostrar la información del teclado
    contextMenu.append(new MenuItem({
        label: 'Keyboard',
        click: () => {
            // Evitar múltiples instancias de la ventana secundaria
            if (keyboardWindow && !keyboardWindow.isDestroyed()) {
                keyboardWindow.focus();
                return;
            }

            keyboardWindow = new BrowserWindow({
                parent: mainWindow, // Ventana principal como padre
                modal: true,        // Comportamiento modal
                width: 400,         // Ajustar el ancho del modal
                height: 400,        // Ajustar la altura del modal
                frame: false,       // Sin barra de título
                resizable: false,   // Deshabilitar redimensionamiento
                webPreferences: {
                    contextIsolation: true, // Mejora de seguridad
                    preload: path.join(__dirname, 'preload.js') // Archivo preload opcional
                }
            });            

            // Cargar el archivo HTML con la información del teclado
            const htmlPath = path.join(__dirname, '../html/keyboard-info.html'); // Ajusta según la estructura
            keyboardWindow.loadFile(htmlPath);

            // Limpiar referencia de la ventana al cerrarla
            keyboardWindow.on('closed', () => {
                keyboardWindow = null;
            });
        }
    }));

    // Mostrar el menú contextual
    return contextMenu;
}

module.exports = { createContextMenu };
