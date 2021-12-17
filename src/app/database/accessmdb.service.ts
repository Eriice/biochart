import { Injectable } from '@angular/core';
import { 数据中心模版 } from './数据中心模版 ';
const electron = (<any>window).require('electron');

@Injectable({
  providedIn: 'root'
})
export class AccessmdbService extends 数据中心模版 {

  constructor() {
    super()
  }
  // 是否已经连接上数据库
  public 是否已经连接数据库: boolean = false;

  // 数据库连接字符串
  private MDB文件路径: string
  // private 驱动字符串: string = "Provider=Microsoft.ACE.OLEDB.12.0"
  private 驱动字符串: string = "Provider=Microsoft.Jet.OLEDB.4.0"

  private get 连接字符串(): string {
    return `${this.驱动字符串};Data Source=${this.MDB文件路径};`
  }

  private 数据库连接: any

  连接数据库() {
    const 连接字符串 = `${this.驱动字符串};Data Source=${this.MDB文件路径};`
    electron.ipcRenderer.send('linkdb', 连接字符串);
    this.是否已经连接数据库 = true
  }

  查询<T>(sql: string): Promise<T> {
    electron.ipcRenderer.send('sqlQuery', sql);
    return new Promise((resolve, reject) => {
      electron.ipcRenderer.once('sqlResult', (event, data, 状态) => {
        if (状态 === "成功") {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  // 搜索项目作为测试查询
  async 测试查询() {
    const sql = `select 记录表.platename as 记录 from vsscanrecord as 记录表 where c_id like '%qc%'`
    const res = await this.查询(sql)
    return res
  }

  获取Mdb文件路径(): Promise<string> {
    electron.ipcRenderer.send('openDialog', "");

    return new Promise((resolve, reject) => {
        // TODO 只识别 mdb
      electron.ipcRenderer.once('fileData', (event, 文件路径: string) => {
        this.MDB文件路径 = 文件路径
        resolve(文件路径)
      })
    })
  }
}
