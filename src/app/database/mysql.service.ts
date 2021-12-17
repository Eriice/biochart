import { Injectable } from '@angular/core';
import { Connection } from 'mysql'
import { 数据中心模版 } from './数据中心模版 ';
const mysql = (<any>window).require('mysql');

@Injectable({
  providedIn: 'root'
})
export class MysqlService extends 数据中心模版 {

  是否已经连接数据库: boolean;

  mysql连接: Connection;

  连接数据库(): void {
    this.mysql连接.connect((err) => {
      if (err) {
        this.是否已经连接数据库 = false
        return console.log(err.stack)
      }
      this.是否已经连接数据库 = true
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

  查询<T>(sql: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mysql连接.query(sql, function (err, results, fields) {
        if (err === null) {
          resolve(results)
        } else {
          reject(err)
        }
      });
    })
  }

  public 测试查询(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
