import { Injectable } from '@angular/core';
import { Connection } from 'mysql'
import { 数据中心模版 } from './数据中心模版 ';
const mysql = (<any>window).require('mysql');

@Injectable({
  providedIn: 'root'
})
export class MysqlService extends 数据中心模版 {
  isLinkDB: boolean;

  mysql连接: Connection;

  protected 连接数据库(): void {
    this.mysql连接.connect((err) => {
      if (err) {
        this.isLinkDB = false
        return console.log(err.stack)
      }
      this.isLinkDB = true
    })
  }

  constructor() {
    super()

    this.mysql连接 = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'scan'
    })
  }

  查询(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mysql连接.query(sql, function (err, results, fields) {
        if (err === null) {
          resolve(results)
        } else {
          reject(err)
        }
        console.log('err', err);
        console.log('results', results[0]);
        console.log('fields', fields[0]);
      });
    })
  }
}
