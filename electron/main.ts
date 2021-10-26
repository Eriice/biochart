import { app, BrowserWindow, ipcMain, ipcRenderer, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }

  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/biochart/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
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

ipcMain.on("navigateDirectory", (event, path) => {
  console.log("on nav")
  process.chdir(path);
  getImages();
  getDirectory();
});

ipcMain.on('openDialog', (event, arg) => {
  dialog.showOpenDialog({
    properties: ["openFile"]
  })
    .then(res => {
      console.log("文件路径", res.filePaths[0])
      res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0])
    })
})