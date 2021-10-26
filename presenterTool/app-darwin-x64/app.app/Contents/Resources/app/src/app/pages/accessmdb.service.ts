import { Injectable } from '@angular/core';
import { 数据中心模版 } from './数据中心模版 ';
const electron = (<any>window).require('electron');

@Injectable({
  providedIn: 'root'
})
export class AccessmdbService extends 数据中心模版 {

  isLinkDB: boolean = false;

  private MDB文件路径: string

  protected 连接数据库(): void {
    const 连接字符串 = `Driver={Microsoft Access Driver (*.mdb,*.accdb};DBQ=${this.MDB文件路径}`

  }
  protected 查询(sql: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  获取Mdb文件路径(): void {
    electron.ipcRenderer.send('openDialog', "");
  }

  constructor() {
    super()

    electron.ipcRenderer.on('fileData', (event, 文件路径: string) => {
      console.log("MDB文件路径", 文件路径)
      this.MDB文件路径 = 文件路径
    })
  }
}
