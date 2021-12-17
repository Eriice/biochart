import { Injectable } from '@angular/core';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 批次阴性数据 } from 'src/app/model/批次阴性数据';
import { 试验组合 } from 'src/app/model/试验组合';
import { BetterLock } from 'better-lock'
import * as _ from 'lodash'
import { 质控框架, 阴性计算方式 } from 'src/app/database/localdb.service';
import { AccessmdbService } from 'src/app/database/accessmdb.service';

@Injectable({
  providedIn: 'root'
})
export class OriginalDataService {
  constructor(
    private readonly 数据服务: AccessmdbService
  ) {
    // this.订阅获取完整数据()
  }

  private _当前组合: 试验组合 = null
  private _试验数据: 批次试验数据[] = []
  private _阴性数据哈希表: Map<string, number[]> = null
  private 锁 = new BetterLock()
  private 数据载入完成: boolean = false
  public async 获取试验数据(组合: 试验组合, 框架: 质控框架) {
    // 待办，会发生多次重复获取试验数据，需要异步锁
    if (_.isEqual(this._当前组合, 组合)) {
      return this._试验数据
    } else {
      this.数据载入完成 = false
    }

    return await this.锁.acquire(async () => {
      if (this.数据载入完成) return this._试验数据
      // let 查询字符串 = `select 批次表.platename as 批次, savetime as 创建时间, reportid, comkindname as 试剂名, comkindcat as 试剂批号, comappratus, comcheckdoctor as 操作人, comtempera, comhumidity, commethod, comwavelength, wassetted, holetype, odnumber as 测量值, odstring, decision, c_id as 样品批号, \`row\` as 行号, col as 列号 from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) WHERE 批次表.comkindcat = '${组合.试剂批号}' and 记录表.c_id = '${组合.样品批号}' and (记录表.c_id like '%qc%') order by 批次表.savetime`
      let 查询字符串 = `select 批次表.platename as 批次, savetime as 创建时间, reportid, comkindname as 试剂名, comkindcat as 试剂批号, comappratus, comcheckdoctor as 操作人, comtemperature, comhumidity, commethod, comwavelength, wassetted, holetype, odnumber as 测量值, odstring, decision, c_id as 样品批号, row as 行号, col as 列号 from vsscanplate as 批次表 inner join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) WHERE 批次表.comkindcat = '${组合.试剂批号}' and 记录表.c_id = '${组合.样品批号}' and (记录表.c_id like '%qc%') order by 批次表.savetime`
      console.log("查询字符串", 查询字符串)
      let 试验数据 = await this.数据服务.查询<批次试验数据[]>(查询字符串)

      // 对阴性数据不做缓存处理，防止新增组合后沿用还是旧数据
      // let 查询阴性字符串 = `select platename as 批次, odnumber as 阴性值 from vsscanrecord where decision like '%NC%'`
      let 查询阴性字符串 = `select platename as 批次, odnumber as 阴性值 from vsscanrecord where decision like '%NC%'`
      let 阴性数据 = await this.数据服务.查询<批次阴性数据[]>(查询阴性字符串)
      this.构建阴性数据哈希表(阴性数据, 框架)

      const 带阴性试验数据 = this.整理试验数据(试验数据)
      this._试验数据 = 带阴性试验数据
      console.log("阴性数据", 带阴性试验数据 )
      this.数据载入完成 = true
      return this._试验数据
    })
  }

  // 没有则添加，相同则取平均
  private 构建阴性数据哈希表(数据: 批次阴性数据[], 框架: 质控框架) {
    const 哈希表 = new Map()
    数据.map(v => {
      const { 批次, 阴性值 } = v
      let 计算阴性值 = 0
      switch (框架.阴性计算方式) {
        case 阴性计算方式.系数相乘:
          if (阴性值 <= 框架.试剂阴性值) {
            计算阴性值 = 框架.试剂系数 * 框架.试剂阴性值
          } else {
            计算阴性值 = 框架.试剂系数 * 阴性值
          }
          break;
        case 阴性计算方式.系数相加:
          if (阴性值 <= 框架.试剂阴性值) {
            计算阴性值 = 框架.试剂系数 + 框架.试剂阴性值
          } else {
            计算阴性值 = 框架.试剂系数 + 阴性值
          }
          break;
        case 阴性计算方式.常量:
          计算阴性值 = 框架.试剂系数 + 阴性值
          break;
        default:
          throw new Error("非在册阴性计算方式")
          break;
      }

      if (哈希表.has(批次)) {
        let 批次阴性数组 = 哈希表.get(批次)
        批次阴性数组.push(计算阴性值)
      } else {
        哈希表.set(批次, [计算阴性值])
      }
    })
    this._阴性数据哈希表 = 哈希表
  }

  // 包括结合阴性数据、计算 s/od 等
  private 整理试验数据(试验数据: 批次试验数据[]): 批次试验数据[] {
    const 哈希表 = this._阴性数据哈希表
    试验数据.map(v => {
      if (typeof(v.创建时间)=='string') {
        v.创建时间 = new Date(v.创建时间)
      }

      if (哈希表.get(v.批次) === undefined) {
      }
      const n = 哈希表.get(v.批次).length
      v.阴性值 = 哈希表.get(v.批次).reduce((累积, 当前) => { return 累积 + 当前 }, 0) / n
      
      v["测量值/阴性值"] = v.测量值 / v.阴性值
    })
    return 试验数据
  }
}
