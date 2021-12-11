"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const ADODB = require('node-adodb');
let win;
if (process.mainModule.filename.indexOf("app.asar") !== -1) {
    ADODB.PATH = './resources/adodb.js';
}
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
let connection = null;
electron_1.ipcMain.on('openDialog', (event, arg) => {
    electron_1.dialog.showOpenDialog({
        properties: ["openFile"]
    })
        .then(res => {
        res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0]);
    });
});
electron_1.ipcMain.on('linkdb', (event, arg) => {
    console.log("arg", arg);
    connection = ADODB.open(arg);
});
electron_1.ipcMain.on('adodbQuery', (event, sql) => {
    if (connection === null)
        return;
    connection.query(sql).then(aaa => {
        win.webContents.send('replayQuery', aaa, connection);
    }).catch(err => {
        win.webContents.send('replayQuery', err, connection);
    });
});
// let connection: any  = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=D:\\code\\biochart.mdb`)
// ipcMain.on('openDialog', (event, arg) => {
//   dialog.showOpenDialog({
//     properties: ["openFile"]
//   })
//     .then(res => {
//       // connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${res.filePaths[0]}`)
//       console.log("connection", connection)
//       res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0])
//       // console.log("begin open dialog")
//       // connection.query(`SELECT 批次表.platename as 批次 FROM vsscanrecord as 批次表`).then(aaa => {
//       //   console.log('res', res)
//       // res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0], aaa)
//       // }).catch(err => {
//       //   console.log("err", err)
//       // res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0], err)
//       // })
//     })
// })
// ipcMain.on('linkdb', (event, arg) => {
//   connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=D:\\code\\biochart.mdb`)
// })
// ipcMain.on('adodbQuery', (event, sql: string) => {
//   console.log("connection", connection)
//   if (connection !== null) {
//     connection.query(sql).then(aaa => {
//       win.webContents.send('replayQuery', aaa)
//     }).catch(err => {
//       win.webContents.send('replayQuery', err)
//     })
//   }
// })
//# sourceMappingURL=main.js.map