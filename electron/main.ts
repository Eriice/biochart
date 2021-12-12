import { app, BrowserWindow, ipcMain, ipcRenderer, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
const ADODB = require('node-adodb')

let win: BrowserWindow;

const 是否开发环境 = process.mainModule.filename.indexOf('app') === -1

global['ADODB'] = ADODB

if (!是否开发环境) {
  console.log("正式环境")
  ADODB.PATH = './resources/adodb.js';
}

// if (process.mainModule.filename.indexOf("app.asar") !== -1) {
//   ADODB.PATH = './resources/adodb.js';
// }
// https://blog.csdn.net/weixin_40629244/article/details/115742250
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
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
  console.log("arg", arg)
  connection = ADODB.open(arg)
})


ipcMain.on('adodbQuery', (event, sql: string) => {
  if (connection === null) return
  connection.query(sql).then(aaa => {
    win.webContents.send('replayQuery', aaa, connection)
  }).catch(err => {
    win.webContents.send('replayQuery', err, connection)
  })
})



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
