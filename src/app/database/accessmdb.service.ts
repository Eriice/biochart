import { Injectable } from '@angular/core';
import { 数据中心模版 } from './数据中心模版 ';
const electron = (<any>window).require('electron');
const adodb = (<any>window).require('node-adodb');
adodb.debug = true

@Injectable({
  providedIn: 'root'
})
export class AccessmdbService extends 数据中心模版 {

  constructor() {
    super()

    // TODO 只识别 mdb
    electron.ipcRenderer.on('fileData', (event, 文件路径: string) => {
      this.MDB文件路径 = 文件路径
    })
  }

  // 是否已经连接上数据库
  public isLinkDB: boolean = false;

  // 数据库连接字符串
  private MDB文件路径: string
  private 驱动字符串: string = "Provider=Microsoft.ACE.OLEDB.12.0"

  private get 连接字符串(): string {
    return `${this.驱动字符串};Data Source=${this.MDB文件路径};`
  }

  private 数据库连接: any

  连接数据库(): void {
    const 连接字符串 = `${this.驱动字符串};Data Source=${this.MDB文件路径};`
    let connection = adodb.open(连接字符串)
    this.数据库连接 = connection
  }

  查询(sql: string): Promise<any> {
    return this.数据库连接.query(sql)
  }

  查询阴性数据(sql: string): Promise<any> {
    return Promise.resolve()
  }

  测试查询(): Promise<any> {
    console.log("连接字符串", this.连接字符串)
    const sql = `SELECT * FROM vsscanrecord`
    return this.数据库连接.query(sql)
  }

  获取Mdb文件路径(): void {
    electron.ipcRenderer.send('openDialog', "");
  }
}
