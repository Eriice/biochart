"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
let win;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, `/../../dist/biochart/index.html`),
        protocol: "file:",
        slashes: true
    }));
    win.webContents.openDevTools();
    win.on("closed", () => {
        win = null;
    });
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
function getImages() {
    const cwd = process.cwd();
    fs.readdir('.', { withFileTypes: true }, (err, files) => {
        if (!err) {
            const re = /(?:\.([^.]+))?$/;
            const images = files
                .filter(file => file.isFile() && ['jpg', 'png'].includes(re.exec(file.name)[1]))
                .map(file => `file://${cwd}/${file.name}`);
            win.webContents.send("getImagesResponse", images);
        }
    });
}
function isRoot() {
    return path.parse(process.cwd()).root == process.cwd();
}
function getDirectory() {
    fs.readdir('.', { withFileTypes: true }, (err, files) => {
        if (!err) {
            const directories = files
                .filter(file => file.isDirectory())
                .map(file => file.name);
            if (!isRoot()) {
                directories.unshift('..');
            }
            win.webContents.send("getDirectoryResponse", directories);
        }
    });
}
electron_1.ipcMain.on("navigateDirectory", (event, path) => {
    console.log("on nav");
    process.chdir(path);
    getImages();
    getDirectory();
});
electron_1.ipcMain.on('openDialog', (event, arg) => {
    electron_1.dialog.showOpenDialog({
        properties: ["openFile"]
    })
        .then(res => {
        console.log("文件路径", res.filePaths[0]);
        res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0]);
    });
});
//# sourceMappingURL=main.js.map