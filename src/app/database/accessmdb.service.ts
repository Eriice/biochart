import { Injectable } from '@angular/core';
import { 数据中心模版 } from './数据中心模版 ';
const electron = (<any>window).require('electron');

// const adodb = (<any>window).require('node-adodb');
// const adodb = (<any>window).require('electron').remote.getGlobal('ADODB');
// adodb.debug = true
// console.log("ADODB.PATH",adodb, adodb.PATH)


@Injectable({
  providedIn: 'root'
})
export class AccessmdbService extends 数据中心模版 {

  constructor() {
    super()

    // TODO 只识别 mdb
    electron.ipcRenderer.on('fileData', (event, 文件路径: string, res) => {
      this.MDB文件路径 = 文件路径
    })
  }
  // 是否已经连接上数据库
  public isLinkDB: boolean = false;

  // 数据库连接字符串
  private MDB文件路径: string
  // private 驱动字符串: string = "Provider=Microsoft.ACE.OLEDB.12.0"
  private 驱动字符串: string = "Provider=Microsoft.Jet.OLEDB.4.0"

  private get 连接字符串(): string {
    return `${this.驱动字符串};Data Source=${this.MDB文件路径};`
  }

  private 数据库连接: any

  连接数据库(): void {
    const 连接字符串 = `${this.驱动字符串};Data Source=${this.MDB文件路径};`
    // let connection = adodb.open(连接字符串)
    // console.log("connection", connection)
    // this.数据库连接 = connection
    electron.ipcRenderer.send('linkdb', 连接字符串);
    this.isLinkDB = true
  }

  查询<T>(sql: string): Promise<T> {
    electron.ipcRenderer.send('adodbQuery', sql);
    return new Promise((resolve, reject) => {
      electron.ipcRenderer.once('replayQuery', (event, data, connection) => {
        console.log("data", data, connection)
        resolve(data)
      })
    })
    // console.log("sql", sql)
    // return this.数据库连接.query(sql)
  }


  async 测试查询() {
    const sql = `SELECT 批次表.platename as 批次 FROM vsscanrecord as 批次表`
    const res = await this.查询(sql)
    console.log('测试结果', res)

    return res
  }

  获取Mdb文件路径(): void {
    electron.ipcRenderer.send('openDialog', "");
  }
}

// select 批次表.platename as 批次, savetime as 创建时间, reportid, comkindname as 试剂名, comkindcat as 试剂批号, comappratus, comcheckdoctor as 操作人, comtempera, comhumidity, commethod, comwavelength, wassetted, holetype, odnumber as 测量值, odstring, decision, c_id as 样品批号, \`row\` as 行号, col as 列号 from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) WHERE 批次表.comkindcat = '${组合.试剂批号}' and 记录表.c_id = '${组合.样品批号}' and (记录表.c_id like '%qc%') order by 批次表.savetime`
 