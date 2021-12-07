import { 批次试验数据 } from "src/app/model/批次试验数据"
import { 批次试验结果 } from "src/app/model/批次试验结果"
import { 即刻法结果 } from "src/app/枚举/即刻法结果"
import { 质控规则枚举 } from "src/app/枚举/质控规则"
import { 质控规则策略, 质控规则策略接口 } from "./质控规则策略"

// nx，n代表失控时统计次数
// 若失控是7x，则n=7
class 策略nx extends 质控规则策略 implements 质控规则策略接口 {
  constructor(readonly n: 7 | 8 | 9 | 10) {
    super()
  }

  规则过滤(): 批次试验结果[] {
    // 设置平均值上下作为累加结果，若大于平均值，且小于平均值的计数器为0，则进行累加，若计数器不为0，则重置
    let 平均值之下 = 0
    let 平均值之上 = 0
    this._结果.map(v => {
      if (v["测量值/阴性值"] > this.平均值) {
        if (平均值之下 == 0) {
          平均值之上++
        } else {
          平均值之上 = 1
          平均值之下 = 0
        }
      } else if (v["测量值/阴性值"] < this.平均值) {
        if (平均值之上 == 0) {
          平均值之下++
        } else {
          平均值之上 = 0
          平均值之下 = 1
        }
      }

      if (平均值之上 == this.n - 1 || 平均值之下 == this.n - 1) {
        v.结果 = 即刻法结果.警告
      } else if (平均值之上 >= this.n || 平均值之下 >= this.n) {
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
}

export class 策略7x extends 策略nx {
  static 描述 = `7x：连续7个数值均在平均值同一侧时失控；6x：连续6个数值均在平均值同一侧时警告`
  static 失控规则名 = `7x`;
  static 警告规则名 = `6x`;
  constructor() {
    super(7)
  }
}

export class 策略8x extends 策略nx {
  static 描述 = `8x：连续8个数值均在平均值同一侧时失控；7x：连续7个数值均在平均值同一侧时警告`
  static 失控规则名 = `8x`;
  static 警告规则名 = `7x`;
  constructor() {
    super(8)
  }
}

export class 策略9x extends 策略nx {
  static 描述 = `9x：连续9个数值均在平均值同一侧时失控；8x：连续8个数值均在平均值同一侧时警告`
  static 失控规则名 = `9x`;
  static 警告规则名 = `8x`;
  constructor() {
    super(9)
  }
}

export class 策略10x extends 策略nx {
  static 描述 = `10x：连续10个数值均在平均值同一侧时失控；9x：连续9个数值均在平均值同一侧时警告`
  static 失控规则名 = `10x`;
  static 警告规则名 = `9x`;
  constructor() {
    super(10)
  }
}
