import { Injectable } from '@angular/core';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 求标准差 } from 'src/app/工具/公式';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
import { OriginalDataService } from './原始数据服务.service';
import { 即刻表数据 } from '../../model/即刻表数据';
import { LocaldbService, 框架统计, 初始框架数据 } from 'src/app/database/localdb.service';
import { CombinationService } from './组合服务';
import { 试验组合 } from 'src/app/model/试验组合';

// https://stackoverflow.com/questions/38571812/how-to-detect-when-an-input-value-changes-in-angular
// https://stackoverflow.com/questions/36986548/when-to-use-asobservable-in-rxjs
// 创建一个属于组件的服务，其他组件通过订阅此服务获得更新
// 即刻法框架在不同阶段有不同状态
// 在质控表还没创建即刻法框架时，【创建质控框架】页面需要获取前20条非失控数据
// 在创建框架后，向初始框架推送数据，而【质控数据监测】、【创建质控框架】
@Injectable({
  providedIn: 'root'
})
export class FilterQualityDataService {
  private n3s = [null, null, 1.16, 1.49, 1.75, 1.94, 2.1, 2.22, 2.32, 2.41, 2.48, 2.55, 2.61, 2.66, 2.71, 2.75, 2.79, 2.82, 2.85, 2.88]
  private n2s = [null, null, 1.15, 1.46, 1.67, 1.82, 1.94, 2.03, 2.11, 2.18, 2.23, 2.29, 2.33, 2.37, 2.41, 2.44, 2.47, 2.5, 2.53, 2.56]

  private SI上限公式 = (数据: number[]) => {
    return (Math.max(...数据) - 数据.reduce((a, v) => a + v) / 数据.length) / 求标准差(数据)
  }

  private SI下限公式 = (数据: number[]) => {
    return (数据.reduce((a, v) => a + v) / 数据.length - Math.min(...数据)) / 求标准差(数据)
  }

  private 判断结果 = (序号: number, SI上限: number, SI下限: number): 即刻法结果 => {
    const SI值 = Math.max(SI上限, SI下限)
    if (SI值 > this.n3s[序号]) {
      return 即刻法结果.失控
    } else if (SI值 <= this.n2s[序号]) {
      return 即刻法结果.在控
    } else {
      return 即刻法结果.警告
    }
  }

  constructor(
    private readonly 本地数据服务: LocaldbService,
    private readonly 组合服务: CombinationService,
  ) {
    // this.订阅获取初始框架()
  }

  // 订阅获取初始框架() {
  //   this.组合服务.当前试验组合$.pipe(switchMap((组合) => {
  //     if (组合 === null) return EMPTY
  //     return combineLatest([this.质控数据服务.试验数据$, this.本地数据服务.判断初始质控框架是否创建(组合), of(组合)])
  //   }), switchMap(([完整数据结果, 初始框架是否创建, 组合]) => {
  //     const [完整数据状态, 完整数据] = 完整数据结果
  //     if (完整数据状态 === 数据状态.更新中) return EMPTY
  //     if (初始框架是否创建) {
  //       return from(this.从本地数据获取框架(组合)).pipe(switchMap(初始框架 => {
  //         this._初始框架.next([数据状态.更新成功, 初始框架])
  //         return this.从本地数据获取框架数据(初始框架.id)
  //       }))
  //     } else {
  //       this._初始框架.next([数据状态.更新成功, null])
  //       return this.从试验数据获取框架数据(完整数据)
  //     }
  //   })).subscribe(即刻表数据 => {
  //     this._即刻法表格数据.next([数据状态.更新成功, 即刻表数据])
  //   }, err => {
  //     console.log("err:", err)
  //     this._即刻法表格数据.next([数据状态.更新失败, []])
  //   })
  // }

  // // 即刻法统计数据
  // private _初始框架 = new BehaviorSubject<[数据状态, 初始框架]>([数据状态.静止, null])
  // 初始框架$ = this._初始框架.asObservable();

  // // 前20条在控数据和数据之间的失控数据 - 也就是有大于20条数据的可能
  // private _即刻法表格数据 = new BehaviorSubject<[数据状态, 即刻表数据[]]>([数据状态.静止, []])
  // 即刻法表格数据$ = this._即刻法表格数据.asObservable();

  // 初始框架 - 只有本地数据库创建了框架才非null
  async 获取初始框架(框架配置Id: number) {
    await this.本地数据服务.获取初始框架(框架配置Id)
  }
  async 创建初始框架(组合: 试验组合, 统计: 框架统计, 框架数据: 初始框架数据[]) {
    await this.本地数据服务.创建初始框架(统计, 框架数据).catch(err => {
      console.error("错误：", err)
      return "创建失败"
    })
    this.组合服务.更新当前试验组合(组合)
  }

  // 原始数据构建即刻表 - 从外部数据库获取
  async 使用试验数据构建框架数据(质控数据: 批次试验数据[]) {
    return this.根据试验数据创建即刻表数据(质控数据)
  }

  // 框架数据构建即刻表 - 从本地数据库获取
  async 从本地获取框架(框架Id: number) {
    return await this.本地数据服务.获取初始框架(框架Id)
  }
  async 从本地获取框架数据(框架Id: number) {
    return await this.本地数据服务.根据框架Id获取初始框架数据(框架Id)
  }

  // 自动获取试验数据的前20条在控数据形成即刻表
  private 根据试验数据创建即刻表数据(批次试验数据列表: 批次试验数据[]): 即刻表数据[] {
    let 试验序号 = 0;
    let 过往在控值: number[] = []
    let 即刻法数据含失控: 即刻表数据[] = []
    while (过往在控值.length < 20 && 试验序号 < 批次试验数据列表.length) {
      const 单条试验 = 批次试验数据列表[试验序号]

      if (试验序号 < 2) {
        let 即刻表接口: 即刻表数据 = {
          序号: 过往在控值.length + 1,
          批次: 单条试验.批次,
          创建时间: 单条试验.创建时间,
          操作人: 单条试验.操作人,
          测量值: 单条试验.测量值,
          阴性值: 单条试验.阴性值,
          '测量值/阴性值': 单条试验['测量值/阴性值'],
          n3s: null,
          n2s: null,
          SI上限: null,
          SI下限: null,
          结果: 即刻法结果.在控,
          行号: 单条试验.行号,
          列号: 单条试验.列号
        }
        过往在控值.push(单条试验['测量值/阴性值'])
        即刻法数据含失控.push(即刻表接口)
      } else {
        let SI上限 = this.SI上限公式([...过往在控值, 单条试验['测量值/阴性值']])
        let SI下限 = this.SI下限公式([...过往在控值, 单条试验['测量值/阴性值']])
        const 结果 = this.判断结果(过往在控值.length, SI上限, SI下限)
        let 即刻表接口: 即刻表数据 = {
          序号: 过往在控值.length + 1,
          批次: 单条试验.批次,
          创建时间: 单条试验.创建时间,
          操作人: 单条试验.操作人,
          测量值: 单条试验.测量值,
          阴性值: 单条试验.阴性值,
          '测量值/阴性值': 单条试验['测量值/阴性值'],
          n3s: this.n3s[过往在控值.length],
          n2s: this.n2s[过往在控值.length],
          SI上限,
          SI下限,
          结果,
          行号: 单条试验.行号,
          列号: 单条试验.列号
        }
        if (结果 !== 即刻法结果.失控) {
          过往在控值.push(单条试验['测量值/阴性值'])
        }
        即刻法数据含失控.push(即刻表接口)
      }
      试验序号++
    }
    return 即刻法数据含失控
  }
}
