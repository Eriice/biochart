import { 批次试验数据 } from "src/app/model/批次试验数据";
import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则枚举 } from "src/app/枚举/质控规则";
import { 质控规则策略, 质控规则策略接口 } from "./质控规则策略";

// nt，n代表失控时统计次数
// 若失控是7t，则n=7
class 策略nt extends 质控规则策略 implements 质控规则策略接口 {
  constructor(readonly n: 7 | 8 | 9 | 10) {
    super()
  }

  规则过滤(): 批次试验结果[] {
    let 递增计数器 = 0
    let 递减计数器 = 0
    this._结果.map((v, i) => {
      if (i == 0) return
      const 上一个数 = this.数据[i - 1]["测量值/阴性值"]
      if (v["测量值/阴性值"] > 上一个数) {
        // 递增中
        if (递减计数器 == 0) {
          递增计数器++
        } else {
          递增计数器 = 1
          递减计数器 = 0
        }
      } else if (v["测量值/阴性值"] < 上一个数) {
        // 递减中
        if (递增计数器 == 0) {
          递减计数器++
        } else {
          递增计数器 = 0
          递减计数器 = 1
        }
      }

      if (递增计数器 == this.n - 2 || 递减计数器 == this.n - 2) {
        v.结果 = 即刻法结果.警告
      } else if (递增计数器 >= this.n - 1 || 递减计数器 >= this.n - 1) {
        v.结果 = 即刻法结果.失控
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
    this._结果 = this.数据.map(v => {
      return { ...v, 结果: 即刻法结果.在控 }
    })
  }

  // 复合规则
  protected 失控警戒值 = 2 ** 0
  protected 警告警戒值 = 0
  protected 是否超过警戒线 = (当前值: number, 平均值: number, 标准差: number) => {
    return Math.abs(当前值 - 平均值) > 标准差 * 2
  }

}

export class 策略7t extends 策略nt {
  static 描述 = `7t：连续7个数值均递增/递减则失控；6t：连续6个数值均递增/递减则警告`
  static 警告规则名 = `6t`;
  static 失控规则名 = `7t`;
  constructor() {
    super(7)
  }
}

export class 策略8t extends 策略nt {
  static 描述 = `8t：连续8个数值均递增/递减则失控；7t：连续7个数值均递增/递减则警告`
  static 警告规则名 = `7t`;
  static 失控规则名 = `8t`;
  constructor() {
    super(8)
  }
}

export class 策略9t extends 策略nt {
  static 描述 = `9t：连续9个数值均递增/递减则失控；8t：连续8个数值均递增/递减则警告`
  static 警告规则名 = `8t`;
  static 失控规则名 = `9t`;
  constructor() {
    super(9)
  }
}

export class 策略10t extends 策略nt {
  static 描述 = `10t：连续10个数值均递增/递减则失控；9t：连续9个数值均递增/递减则警告`
  static 警告规则名 = `9t`;
  static 失控规则名 = `10t`;
  constructor() {
    super(10)
  }
}