import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { 试验组合 } from '../model/试验组合';
import { 即刻法结果 } from '../枚举/即刻法结果';
import { 组合状态枚举 } from '../枚举/组合状态枚举';
import { 质控规则枚举, 质控规则模式枚举 } from '../枚举/质控规则';

export enum 阴性计算方式 {
  系数相乘 = "系数相乘",
  系数相加 = "系数相加",
  常量 = "常量",
}

// 以连接字符串作为唯一标识
export interface 数据库连接 {
  id?: number;
  创建时间: Date;
  连接字符串: string;
}

// 假定一个组合只有一个唯一的框架，按常规应该 [试剂编号+样品编号] 形成复合主键。但由于数据源的产生和数据选取具有不确定性，所以新增自增id作为主键，[试剂编号+样品编号] 退化为复合索引
// 即刻法框架表是保存框架创建后后的结果
export interface 质控框架 {
  id?: number;
  创建时间: Date;
  阴性计算方式: 阴性计算方式;
  试剂阴性值: number,
  试剂系数: number,
  框架状态: 组合状态枚举

  试剂批号: string;
  样品批号: string;

  质控规则模式: 质控规则模式枚举
  质控规则: 质控规则枚举[]
}

export enum 框架统计类型 {
  创建,
  滚动
}

export interface 框架统计 {
  id?: number;
  // 质控框架配置Id
  框架Id: number;
  框架统计类型: 框架统计类型

  创建时间: Date;
  更新截止时间: Date;

  平均值: number;
  标准差: number;

  在控数: number;
  警告数: number;
  失控数: number;
}

export interface 初始框架数据 {
  id?: number;
  框架统计Id?: number;

  序号: number;
  // 批次+行+列+检验日期+操作人 确定了外部数据库唯一字段
  批次: string;
  行号: number;
  列号: number;
  创建时间: Date;
  操作人: string;

  测量值: number;
  阴性值: number;

  "测量值/阴性值": number;

  n3s?: number
  n2s?: number

  SI上限?: number
  SI下限?: number

  结果: 即刻法结果
}

// 增量更新记录
export interface 滚动框架数据 {
  id?: number;
  框架统计Id?: number

  批次: string;
  行号: number;
  列号: number;
  创建时间: Date;
  操作人: string;
  测量值: number;
  阴性值: number;
  "测量值/阴性值": number;
  结果: 即刻法结果
}

class 生物质控数据库 extends Dexie {
  public 数据库连接表: Dexie.Table<数据库连接, number>;
  public 质控框架表: Dexie.Table<质控框架, number>;
  public 框架统计表: Dexie.Table<框架统计, number>;
  public 初始框架数据表: Dexie.Table<初始框架数据, number>;
  public 滚动框架数据表: Dexie.Table<滚动框架数据, number>;

  public constructor() {
    // 创建生物质控数据库
    super("质控数据库")
    // 建立索引
    this.version(1.3).stores({
      数据库连接表: "++id, 创建时间",
      质控框架表: "++id, 创建时间, [试剂批号+样品批号]",
      框架统计表: "++id, 创建时间, 框架Id",
      初始框架数据表: "++id, 批次, 框架统计Id, 创建时间, 操作人",
      滚动框架数据表: "++id, 批次, 框架统计Id, 创建时间, 操作人",
    })
    // .upgrade(tx => {
    //   this.初始框架数据表.toCollection().modify(数据项 => {
    //     数据项.创建时间 = 数据项['创建日期']
    //     delete 数据项['创建日期']
    //   })
    //   this.滚动框架数据表.toCollection().modify(数据项 => {
    //     数据项.创建时间 = 数据项['创建日期']
    //     delete 数据项['创建日期']
    //   })
    // })

    this.数据库连接表 = this.table("数据库连接表")
    this.质控框架表 = this.table("质控框架表")
    this.框架统计表 = this.table("框架统计表")
    this.初始框架数据表 = this.table("初始框架数据表")
    this.滚动框架数据表 = this.table("滚动框架数据表")
  }
}

@Injectable({
  providedIn: 'root'
})
// 使用 indexeddb 作为本地数据库
export class LocaldbService {
  private 数据库: 生物质控数据库
  private 质控框架表: Dexie.Table<质控框架, number>;
  private 框架统计表: Dexie.Table<框架统计, number>;
  private 初始框架数据表: Dexie.Table<初始框架数据, number>;
  private 滚动框架数据表: Dexie.Table<滚动框架数据, number>;
  private 数据库连接表: Dexie.Table<数据库连接, number>;
  
  constructor() {
    const 数据库 = new 生物质控数据库();
    this.数据库 = 数据库
    this.质控框架表 = 数据库.质控框架表
    this.框架统计表 = 数据库.框架统计表
    this.初始框架数据表 = 数据库.初始框架数据表
    this.滚动框架数据表 = 数据库.滚动框架数据表
    this.数据库连接表 = 数据库.数据库连接表
  }

  /* 数据连接部分 */
  async 获取最初数据库连接() {
    let 列表 = await this.数据库连接表.toArray()
    return 列表[0] || null
  }
  async 新增数据库连接(数据库连接: 数据库连接) {
    await this.数据库连接表.add(数据库连接)
  }

  /* 质控框架部分开始 */
  async 获取质控框架(组合: 试验组合) {
    return await this.质控框架表.get(组合) || null
  }

  async 更新质控框架状态(框架Id: number, 框架状态) {
    return await this.质控框架表.update(框架Id, { 框架状态 })
  }

  async 创建质控框架(质控框架配置: 质控框架) {
    return await this.质控框架表.add(质控框架配置)
  }
  /* 质控框架部分结束 */


  /* 框架统计部分开始 */
  async 获取最后的框架统计(框架Id: number) {
    return await this.框架统计表.where({ 框架Id }).last() || null
  }

  async 获取框架统计列表(框架Id: number) {
    return await this.框架统计表.where({ 框架Id }).sortBy('创建时间')
  }

  async 获取框架数据列表(框架Id: number) {
    if (框架Id === null) return null
    const 统计列表 = await this.获取框架统计列表(框架Id)
    // let 框架数据: (初始框架数据 | 滚动框架数据)[] = []

    let 框架数据 = await Promise.all(统计列表.map(v => {
      if (v.框架统计类型 === 框架统计类型.创建) {
        return this.获取初始框架数据(v.id)
      } else if (v.框架统计类型 === 框架统计类型.滚动) {
        return this.获取滚动框架数据(v.id)
      }
    }))

    let 数据平铺: (初始框架数据 | 滚动框架数据)[] = 框架数据.reduce((累计, 当前值) => 累计.concat(当前值), [])
    return 数据平铺
  }

  /* 框架统计部分结束 */


  /* 初始质控框架数据开始 */
  async 获取初始框架(框架Id: number) {
    return await this.框架统计表.where({ 框架Id }).first() || null
  }

  async 根据框架Id获取初始框架数据(框架Id: number) {
    const 框架统计 = await this.获取初始框架(框架Id)
    if (框架统计 === null) return null
    return await this.获取初始框架数据(框架统计.id)
  }
  async 获取初始框架数据(框架统计Id: number) {
    return await this.初始框架数据表.where({ 框架统计Id }).sortBy("创建时间")
  }

  // 包括框架结果和框架数据
  async 创建初始框架(统计: 框架统计, 框架数据: 初始框架数据[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.数据库.transaction('rw', this.框架统计表, this.初始框架数据表, this.质控框架表, async () => {
        const 统计Id = await this.框架统计表.add(统计)
        框架数据.map(v => v.框架统计Id = 统计Id)
        let _ = await this.初始框架数据表.bulkAdd(框架数据)
        // 更新框架状态
        await this.质控框架表.update(统计.框架Id, { 框架状态: 组合状态枚举.已创建框架 })
        resolve('创建成功')
      }).catch(err => {
        console.log("err", err)
        reject(`创建失败：${err}`)
      })
    })
  }
  /* 初始质控框架数据结束 */


  /* 滚动质控框架数据开始 */
  async 获取滚动框架数据(框架统计Id: number) {
    return await this.滚动框架数据表.where({ 框架统计Id }).sortBy("创建时间")
  }
  async 创建滚动框架(结果: 框架统计, 框架数据: 滚动框架数据[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.数据库.transaction('rw', this.框架统计表, this.滚动框架数据表, this.质控框架表, async () => {
        const 统计Id = await this.框架统计表.add(结果)
        框架数据.map(v => v.框架统计Id = 统计Id)
        let _ = await this.滚动框架数据表.bulkAdd(框架数据)
        // 更新框架状态
        await this.质控框架表.update(结果.框架Id, { 框架状态: 组合状态枚举.已创建框架 })
        resolve("创建成功")
      }).catch(err => {
        reject(`创建失败：${err}`)
      })
    })
  }
  /* 滚动质控框架数据结束 */
}
