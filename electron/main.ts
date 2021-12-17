import { app, BrowserWindow, ipcMain, ipcRenderer, dialog } from "electron";
import { autoUpdater } from "electron-updater"
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
const ADODB = require('node-adodb')

import {uploadUrl} from "./config";

let win: BrowserWindow;

if (process.mainModule.filename.indexOf("app.asar") !== -1) {
  ADODB.PATH = './resources/adodb.js';
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
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

  // 打开调试
  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });

  // 尝试更新
  updateHandle()
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
  process.chdir(path);
  getImages();
  getDirectory();
});

let connection: any  = null
ipcMain.on('openDialog', (event, arg) => {
  dialog.showOpenDialog({
    properties: ["openFile"]
  })
    .then(res => {
      res.filePaths.length > 0 && win.webContents.send("fileData", res.filePaths[0])
    })
})

ipcMain.on('linkdb', (event, arg) => {
  connection = ADODB.open(arg)
  // connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\\Users\\wbin_120295906419210\\Downloads\\biochart.mdb`)
  console.log("2. 连接信息：", connection)
})


ipcMain.on('sqlQuery', (event, sql: string) => {
  if (connection === null) {
    event.reply('sqlResult', [], connection)
  } else {
    connection.query(sql).then(data => {
      event.reply('sqlResult', data, '成功')
    }).catch(err => {
      event.reply('sqlResult', err, '失败')
    })
  }
})


// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle() {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
  };
  const os = require('os');

  autoUpdater.setFeedURL(uploadUrl);
  autoUpdater.on('error', function (error) {
    sendUpdateMessage(message.error)
  });
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  });
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(message.updateAva)
  });
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva)
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    win.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

    ipcMain.on('isUpdateNow', (e, arg) => {
      console.log(arguments);
      console.log("开始更新");
      //some code here to handle event
      autoUpdater.quitAndInstall();
    });

    win.webContents.send('isUpdateNow')
  });

  ipcMain.on("checkForUpdate", () => {
      //执行自动更新检查
      autoUpdater.checkForUpdates();
  })
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
  win.webContents.send('message', text)
}