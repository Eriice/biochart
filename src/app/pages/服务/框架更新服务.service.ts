// import { Injectable } from '@angular/core';
// import { BehaviorSubject, EMPTY, from, of } from 'rxjs';
// import { first, switchMap } from 'rxjs/operators';
// import { LocaldbService, 滚动框架数据 } from 'src/app/database/localdb.service';
// import { 批次试验数据 } from 'src/app/model/批次试验数据';
// import { 求平均值, 求标准差 } from 'src/app/工具/公式';
// import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
// import { 数据状态 } from 'src/app/枚举/数据状态';
// import { 质控规则枚举, 质控规则模式枚举 } from 'src/app/枚举/质控规则';
// import { FilterQualityDataService } from './即刻法服务.service';
// import { CombinationService } from './组合服务';
// import { 策略13s } from './规则策略/策略13s';
// import { 策略22s } from './规则策略/策略22s';
// import { 策略31s, 策略41s } from './规则策略/策略n1s';
// import { 策略7t, 策略8t, 策略9t, 策略10t } from './规则策略/策略nt';
// import { 策略7x, 策略8x, 策略9x, 策略10x } from './规则策略/策略nx';
// import { 累次规则基类, 规则13s, 规则22s, 质控规则策略接口 } from './规则策略/质控规则策略';
// import { OriginalDataService } from './原始数据服务.service';

// interface 框架数据接口 {
//   批次: string;
//   测量值: number;
//   阴性值?: number;
//   "测量值/阴性值": number;
//   结果: 即刻法结果
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class FrameworkUpdateService {
//   private _滚动框架配置 = new BehaviorSubject<[数据状态, 滚动框架配置]>([数据状态.静止, null])
//   滚动框架配置$ = this._滚动框架配置.asObservable();
//   private _滚动框架 = new BehaviorSubject<[数据状态, 滚动框架]>([数据状态.静止, null])
//   滚动框架$ = this._滚动框架.asObservable();

//   constructor(
//     private readonly 质控数据服务: OriginalDataService,
//     private readonly 即刻法服务: FilterQualityDataService,
//     private readonly 本地数据服务: LocaldbService,
//     private readonly 组合服务: CombinationService
//   ) {
//     // this.订阅获取滚动框架()
//   }

//   // private 订阅获取滚动框架() {
//   //   this.组合服务.当前试验组合$.pipe(switchMap((组合) => {
//   //     this._滚动框架.next([数据状态.更新成功, null])
//   //     if (组合 === null) return EMPTY
//   //     return this.本地数据服务.获取初始质控框架(组合)
//   //   }), switchMap((初始框架) => {
//   //     if (初始框架 === null) {
//   //       this._滚动框架配置.next([数据状态.更新成功, null])
//   //       return EMPTY
//   //     }
//   //     this._滚动框架配置.next([数据状态.更新中, null])
//   //     return this.本地数据服务.获取滚动框架配置(初始框架.id)
//   //   })).subscribe(滚动框架配置 => {
//   //     this._滚动框架配置.next([数据状态.更新成功, 滚动框架配置])
//   //   })
//   // }

//   public 策略列表: 质控规则枚举[][] = [
//     ['13s'],
//     ['22s'],
//     // ['31s', 策略41s],
//     // [策略7x, 策略8x, 策略9x, 策略10x],
//     // [策略7t, 策略8t, 策略9t, 策略10t]
//   ]
//   // public 质控规则哈希表: Map<质控规则枚举, { 失控: string, 警告: string, 规则: (typeof 累次规则基类) | (typeof 规则13s) }> = new Map()
//   public 质控规则键值对: Record<质控规则枚举, { 失控: string, 警告: string, 规则: (typeof 累次规则基类) | (typeof 规则13s) }> = {
//     '13s': { 失控: '13s', 警告: '12s', 规则: 规则13s },
//     '22s': { 失控: '13s', 警告: '12s', 规则: 规则22s }
//   }

//   async 创建滚动框架配置(初始框架Id: number, 质控规则模式: 质控规则模式枚举, 质控规则: 质控规则枚举[]) {
//     this._滚动框架配置.next([数据状态.更新中, null])
//     const 配置 = await this.本地数据服务.创建滚动框架配置(初始框架Id, 质控规则模式, 质控规则)
//     setTimeout(() => {
//       this._滚动框架配置.next([数据状态.更新成功, 配置])
//     }, 2000);
//   }

//   // 1. 目标：给定日期和策略，计算最新的平均值和标准差
//   // 2. 难点：外部数据库没有id或者排序，不能直接查询某条数据之后的数据。所以改用时间作为分界点
//   // 3. 过程：根据初始框架Id找到最后的滚动框架的截止日期，到传入的更新截止日期之间的数据。这些数据，根据最后的滚动框架的平均值和标准差，结合策略，标记其结果写入数据库
//   // 4. 若没有最新滚动框架，则需要更新的数据为截止日期减去初始框架的数据
//   // 5. 若有最后的滚动框架，则使用最后滚动框架截止日期加一天到外部数据库搜索
//   // 6. 疑惑点：关于截止日期，用户感知的截止日期，例如6月27日，是包含27日，不包含28日，但是sql的会将28日0点的数据也包含在内。逻辑的转换由前端进行，用户选择27，传入后台为28.00.00。对于数据库来说，28.00.00 是不包含本身。
//   async 更新滚动框架(初始框架Id: number, 截止时间?: Date) {
//     // 先判断截止时间是否大于最后的滚动框架的截止时间
//     const 最后的滚动框架 = await this.本地数据服务.获取最后的滚动框架(初始框架Id)

//     let 需要更新的数据: 批次试验数据[] = []
//     const 试验数据结果 = await this.质控数据服务.试验数据$.pipe(first()).toPromise()

//     const 截止日期前数据 = 试验数据结果[1].filter((v) => {
//       // 若没有传入时间，则不需要时间过滤
//       if (截止时间 === undefined) return true
//       return v.创建时间 < 截止时间
//     })
//     let 平均值 = 0
//     let 标准差 = 0
//     if (最后的滚动框架 === null) {
//       /* 排除即刻法数据 */
//       const 即刻法结果 = await this.即刻法服务.即刻法表格数据$.pipe(first()).toPromise()
//       // 试验记录的批次、行号、列号、日期、结果构成唯一标识
//       const 即刻法数据Id = 即刻法结果[1].map(v => `${v.批次},${v.行号},${v.列号},${v.创建时间.valueOf()},${v.测量值},${v.操作人}`)
//       // 截止日期前数据 减去 即刻表数据
//       需要更新的数据 = 截止日期前数据.filter(v => {
//         const 数据Id = `${v.批次},${v.行号},${v.列号},${v.创建时间.valueOf()},${v.测量值},${v.操作人}`
//         return !即刻法数据Id.includes(数据Id)
//       })
//       let 初始框架结果 = await this.即刻法服务.初始框架$.pipe(first()).toPromise()
//       let 初始框架 = 初始框架结果[1]
//       平均值 = 初始框架.平均值
//       标准差 = 初始框架.标准差
//     } else {
//       let 框架截止时间 = 最后的滚动框架.更新截止时间
//       if (框架截止时间 > 截止时间) {
//         throw new Error("截止时间不能小于上一次更新时间")
//       }
//       /* 排除所有滚动框架数据 */
//       需要更新的数据 = 截止日期前数据.filter(v => {
//         return v.创建时间 > 最后的滚动框架.更新截止时间
//       })
//       平均值 = 最后的滚动框架.平均值
//       标准差 = 最后的滚动框架.标准差
//     }

//     // 从滚动框架配置获取其质控规则
//     const 滚动框架配置 = await this.本地数据服务.获取滚动框架配置(初始框架Id)
//     if (滚动框架配置.质控规则模式 === 质控规则模式枚举.单规则) {
//       const 质控规则 = 滚动框架配置.质控规则[0]
//       let 质控规则类 = this.质控规则键值对[质控规则].规则
//       let 策略实例 = new 质控规则类(需要更新的数据, 平均值, 标准差)

//       策略实例.设置数据(需要更新的数据, 平均值, 标准差)
//       const 过滤结果 = 策略实例.规则过滤()
//       return 过滤结果
//     } else if (滚动框架配置.质控规则模式 === 质控规则模式枚举.复合规则) {
//       let 规则类列表: typeof 质控规则策略[] = []
//       滚动框架配置.质控规则.forEach((规则枚举) => {
//         this.质控规则哈希表.forEach((value, key) => {
//           if (value === 规则枚举) {
//             规则类列表.push(key)
//           }
//         })
//       })


//     }
//   }

//   async 计算滚动框架(初始框架Id: number, 最新滚动框架数据: 框架数据接口[]) {
//     let 数据汇总: 框架数据接口[] = []
//     // 初始框架数据
//     const 初始框架数据 = await this.本地数据服务.获取初始质控框架数据(初始框架Id)
//     数据汇总.push(...初始框架数据)
//     // 历史滚动框架
//     const 滚动框架 = await this.本地数据服务.获取滚动框架列表(初始框架Id)
//     Promise.all(滚动框架.map(滚动框架 => this.本地数据服务.获取滚动框架数据(滚动框架.id))).then(滚动框架数据列表 => {
//       滚动框架数据列表.forEach(每批数据 => {
//         数据汇总.push(...每批数据)
//       })
//     })
//     数据汇总.push(...最新滚动框架数据)

//     const 非失控数据 = 数据汇总.filter(v => v.结果 !== 即刻法结果.失控).map(v => {
//       return v['测量值/阴性值']
//     })
//     return { 平均值: 求平均值(非失控数据), 标准差: 求标准差(非失控数据) }
//   }

//   async 创建滚动框架(初始框架Id: number, 平均值: number, 标准差: number, 数据: 滚动框架数据[]) {
//     if (数据.length === 0) return
//     this._滚动框架.next([数据状态.更新中, null])
//     const 更新截止时间 = new Date(Math.max(...数据.map(v => v.创建时间.valueOf())))
//     let 统计信息 = { 初始框架Id, 平均值, 标准差, 创建时间: new Date(), 更新截止时间 }
//     await this.本地数据服务.创建滚动框架(统计信息, 数据)
//     const 滚动框架 = await this.本地数据服务.获取最后的滚动框架(初始框架Id)
//     this._滚动框架.next([数据状态.更新成功, 滚动框架])
//   }
// }