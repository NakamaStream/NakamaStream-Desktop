const { build } = require("electron-builder");

async function buildApp() {
  try {
    await build({
      config: {
        appId: "lat.nakamastream.desktop",
        productName: "NakamaStream",
        directories: {
          output: "dist/build"
        },
        files: [
          "dist/**/*", 
          "main.js", 
          "package.json",
          "src/resources/html/loading.html" // Aquí agregamos el archivo HTML
        ],
        win: {
          target: [
            {
              target: "nsis",
              arch: ["ia32", "x64"]
            },
            {
              target: "zip",
              arch: ["ia32", "x64"]
            }
          ],
          icon: "src/resources/img/NakamStreamIcon.ico",
          artifactName: "win/${productName}-${version}-${arch}.${ext}"
        }
      }
    });

    console.log("Build completado exitosamente.");
  } catch (error) {
    console.error("Error al compilar la aplicación:", error);
  }
}

buildApp();
