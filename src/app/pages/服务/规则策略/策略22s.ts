import { 批次试验数据 } from "src/app/model/批次试验数据";
import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则策略, 质控规则策略接口 } from "./质控规则策略";

export class 策略22s extends 质控规则策略 implements 质控规则策略接口 {
  constructor() {
    super()
  }

  static 描述 = "22s：连续两个数值超过2倍标准差时失控；12s：数值超过2倍标准差时警告"
  static 警告规则名 = "12s";
  static 失控规则名 = "22s";

  规则过滤(): 批次试验结果[] {
    let 警告标记 = 0
    this._结果.map(v => {
      if (Math.abs(v["测量值/阴性值"] - this.平均值) > this.标准差 * 2) {
        警告标记++
        if (警告标记 == 1) {
          v.结果 = 即刻法结果.警告
        } else if (警告标记 >= 2) {
          v.结果 = 即刻法结果.失控
        }
      } else {
        警告标记 = 0
      }
    })
    return this._结果
  }

  数据: 批次试验数据[]
  private _结果: 批次试验结果[]
  平均值: number
  标准差: number

  设置数据(数据: 批次试验数据[], 平均值: number, 标准差?: number) {
    this.数据 = 数据
    this.平均值 = 平均值
    this.标准差 = 标准差
    // 所有默认在控，当超过2s标记为警告，连续两个及以上警告即失控
    // this.数据.map(v => v.结果 = 即刻法结果.在控)
    this._结果 = this.数据.map(v => {
      return { ...v, 结果: 即刻法结果.在控 }
    })
  }

  // 复合规则
  protected 失控警戒值 = 2 ** 0
  protected 警告警戒值 = 0
  protected 警戒次数: number = 1
  protected 是否超过警戒线 = (当前值: number, 平均值: number, 标准差: number) => {
    return Math.abs(当前值 - 平均值) > 标准差 * 2
  }
}

// // 复合规则运算
// private 失控警戒值 = 2 ** 0
// private 警告警戒值 = 0
// private 是否超过警戒线 = (当前值: number, 平均值: number, 标准差: number) => {
//   return Math.abs(当前值 - 平均值) > 标准差 * 2
// }
// // 按位运算，超过警戒线记为1，不超为0
// private 计算前n条是否超过警戒线 = (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number, n: number) => {
//   let 总数 = 0;
//   let 非失控条数 = 0;
//   // i 可以大于 n
//   let i = 0;

//   // 对于存在失控数据，则需要跳过失控数据 
//   while (非失控条数 < n && i < 数据.length) {
//     let 当前数据 = 数据[索引 - 1 - i]
//     if (当前数据.结果 !== 即刻法结果.失控) {
//       if (this.是否超过警戒线(当前数据["测量值/阴性值"], 平均值, 标准差)) {
//         总数 += 2 ** 非失控条数
//       }
//       非失控条数++
//     }
//     i++
//   }
//   return 总数
// }

// public 复合策略函数 = (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number) => {
//   const 当前值 = 数据[索引]["测量值/阴性值"]

//   const 位值 = this.计算前n条是否超过警戒线(数据, 索引, 平均值, 标准差, 1)
//   if (位值 >= this.失控警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//     return 即刻法结果.失控
//   }

//   if (位值 >= this.警告警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//     return 即刻法结果.警告
//   }

//   return 即刻法结果.在控
// }

// 按位运算，超过警戒线记为1，不超为0
let 计算前n条是否超过警戒线 = (数据: 批次试验结果[], 索引: number, 平均值: number, n: number) => {
  let 总数 = 0;
  let 非失控条数 = 0;
  // i 可以大于 n
  let i = 0;

  // 对于存在失控数据，则需要跳过失控数据 
  while (非失控条数 < n && i < 数据.length) {
    let 当前数据 = 数据[索引 - 1 - i]
    if (当前数据.结果 !== 即刻法结果.失控) {
      if (当前数据["测量值/阴性值"] > 平均值) {
        总数 += 2 ** 非失控条数
      }
      非失控条数++
    }
    i++
  }

  return 总数
}