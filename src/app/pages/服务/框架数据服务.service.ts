import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { LocaldbService, 初始框架数据, 框架统计, 框架统计类型, 滚动框架数据, 质控框架 } from 'src/app/database/localdb.service';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 试验组合 } from 'src/app/model/试验组合';
import { 求平均值, 求标准差 } from 'src/app/工具/公式';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
import { 质控规则枚举 } from 'src/app/枚举/质控规则';
import { OriginalDataService } from './原始数据服务.service';
import { 规则10x, 规则12x, 规则13s, 规则22s, 规则31s, 规则41s, 规则7t, 规则7x, 规则8x, 规则9x } from './规则策略/质控规则策略';

// 提供最新框架统计
// 提供完整的框架列表
// 提供完整的带结果数据
@Injectable({
  providedIn: 'root'
})
export class FrameworkDataService {
  constructor(
    private readonly 本地数据服务: LocaldbService,
    private readonly 原始数据服务: OriginalDataService
  ) {
  }

  public 策略列表: 质控规则枚举[][] = [
    [质控规则枚举['13s']],
    [质控规则枚举['22s']],
    [质控规则枚举['31s'], 质控规则枚举['41s']],
    [质控规则枚举['7x'], 质控规则枚举['8x'], 质控规则枚举['9x'], 质控规则枚举['10x'], 质控规则枚举['12x']],
    [质控规则枚举['7t']]
  ]

  public 质控规则键值对: Record<质控规则枚举, { 失控: string, 警告: string, 规则: (typeof 规则22s) | (typeof 规则13s) | typeof 规则7t }> = {
    '13s': { 失控: '13s', 警告: '12s', 规则: 规则13s },
    '22s': { 失控: '22s', 警告: '12s', 规则: 规则22s },
    '31s': { 失控: '31s', 警告: '21s', 规则: 规则31s },
    '41s': { 失控: '41s', 警告: '31s', 规则: 规则41s },
    '7x': { 失控: '7x', 警告: '6x', 规则: 规则7x },
    '8x': { 失控: '8x', 警告: '7x', 规则: 规则8x },
    '9x': { 失控: '9x', 警告: '8x', 规则: 规则9x },
    '10x': { 失控: '10x', 警告: '9x', 规则: 规则10x },
    '12x': { 失控: '12x', 警告: '11x', 规则: 规则12x },
    '7t': { 失控: '7t', 警告: '6t', 规则: 规则7t },
  }

  // 创建质控框架配置
  async 创建质控框架(框架: 质控框架) {
    return await this.本地数据服务.创建质控框架(框架)
  }

  async 获取质控框架(组合: 试验组合) {
    return this.本地数据服务.获取质控框架(组合)
  }

  // 查看框架创建/更新记录
  async 获取框架统计列表(框架Id: number) {
    if (框架Id === null) return []
    return await this.本地数据服务.获取框架统计列表(框架Id)
  }

  async 获取最新框架统计(框架Id: number) {
    return await this.本地数据服务.获取最后的框架统计(框架Id)
  }

  private 转批次试验结果(数据: (初始框架数据 | 滚动框架数据 | 批次试验数据)[]): 批次试验结果[] {
    return 数据.map(v => {
      // 若为批次试验数据，转换后结果为null
      let 结果: 即刻法结果 = ('结果' in v) ? v['结果'] : null
      return {
        批次: v.批次,
        创建时间: v.创建时间,
        测量值: v.测量值,
        阴性值: v.阴性值,
        "测量值/阴性值": v['测量值/阴性值'],
        行号: v.行号,
        列号: v.列号,
        操作人: v.操作人,
        结果: 结果
      }
    })
  }

  // 至少创建了即刻表，即可以获取一次框架统计
  // 在组合状态变更后，重新获取一次框架数据，并更新可更新数据
  // 待办 当组合变更时候，多个订阅此接口会重复获取数据
  private _可更新数据: 批次试验结果[] = []
  public 获取可更新数据(截止时间: Date) {
    return this._可更新数据.filter(v => v.创建时间 < 截止时间)
  }
  async 获取框架数据(框架Id: number, 组合: 试验组合) {
    if (框架Id === null) return null
    const 框架配置 = await this.本地数据服务.获取质控框架(组合)
    const 原始数据 = await this.原始数据服务.获取试验数据(组合, 框架配置)
    const 最新框架统计 = await this.获取最新框架统计(框架Id)
    const 框架数据 = await this.本地数据服务.获取框架数据列表(框架Id)

    if (最新框架统计 === null) {
      return null
    }

    // 以最新框架的结束时间开始作为需要计算结果的数据
    let 需要更新的数据 = 原始数据.filter(v => {
      return v.创建时间 > 最新框架统计.更新截止时间
    })
    let 已入库数据 = this.转批次试验结果(框架数据)
    let 未入库数据 = this.转批次试验结果(需要更新的数据)

    let { 质控规则 } = 框架配置

    // 遍历规则类
    let 规则实例列表 = []
    质控规则.forEach(单规则 => {
      if (单规则 === null) return
      let 规则类 = this.质控规则键值对[单规则].规则
      // 规则类和外部数据具有共同引用
      let 规则实例 = new 规则类(未入库数据, 最新框架统计.平均值, 最新框架统计.标准差)
      规则实例列表.push(规则实例)
    })

    未入库数据.forEach((v, idx) => {
      规则实例列表.forEach(规则实例 => {
        // 如果已被任意一个规则定义为失控，则另外规则不需要再进行判断
        if (v.结果 === 即刻法结果.失控) return
        v.结果 = 规则实例.计算即刻法结果(idx)
      })
    })
    // 同时更新可更新数据
    this._可更新数据 = [...未入库数据]
    return [...已入库数据, ...未入库数据]
  }

  // 截止日期包含截止当天
  async 创建滚动框架(框架Id: number, 截止日期: Date) {
    let 更新数据 = this._可更新数据.filter(v => v.创建时间 < 截止日期)
    const 非失控数据 = 更新数据.filter(v => v.结果 !== 即刻法结果.失控).map(v => {
      return v['测量值/阴性值']
    })
    const 框架数据 = await this.本地数据服务.获取框架数据列表(框架Id)
    const 非失控历史数据 = 框架数据.filter(v => v.结果 !== 即刻法结果.失控).map(v => {
      return v['测量值/阴性值']
    })
    let 所有数据 = [...非失控历史数据, ...非失控数据]

    let 统计: 框架统计 = {
      框架Id,
      框架统计类型: 框架统计类型.滚动,
      创建时间: new Date(),
      更新截止时间: 更新数据[更新数据.length - 1].创建时间,
      平均值: 求平均值(所有数据),
      标准差: 求标准差(所有数据),
      在控数: 更新数据.filter(v => v.结果 === 即刻法结果.在控).length,
      警告数: 更新数据.filter(v => v.结果 === 即刻法结果.警告).length,
      失控数: 更新数据.filter(v => v.结果 === 即刻法结果.失控).length
    }

    this.本地数据服务.创建滚动框架(统计, 更新数据)
  }
}
