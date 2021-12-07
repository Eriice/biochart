
import { 批次试验数据 } from "src/app/model/批次试验数据";
import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则策略, 质控规则策略接口 } from "./质控规则策略";

// n1s，n代表失控时统计次数
// 若失控是41s，则n=4
class 策略n1s extends 质控规则策略 implements 质控规则策略接口 {
  constructor(readonly n: 3 | 4) {
    super()
  }

  规则过滤(): 批次试验结果[] {
    let 警告标记 = 0
    this._结果.map(v => {
      if (Math.abs(v["测量值/阴性值"] - this.平均值) > this.标准差) {
        警告标记++
        if (警告标记 == this.n - 2) {
        } else if (警告标记 == this.n - 1) {
          v.结果 = 即刻法结果.警告
        } else if (警告标记 >= this.n) {
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
    this._结果 = this.数据.map(v => {
      return { ...v, 结果: 即刻法结果.在控 }
    })
  }

  // 复合规则
  protected 是否超过警戒线 = (当前值: number, 平均值: number, 标准差: number) => {
    return Math.abs(当前值 - 平均值) > 标准差
  }
}

export class 策略31s extends 策略n1s {
  static 描述 = `31s：连续3个数值超过1倍标准差时失控；21s：连续2个数值超过1倍标准差时警告`
  static 失控规则名 = `31s`;
  static 警告规则名 = `21s`;

  constructor() {
    super(3)
  }

  protected 失控警戒值 = 2 ** 0
  protected 警告警戒值 = 0
  protected 警戒次数 = 2
}

export class 策略41s extends 策略n1s {
  static 描述 = `41s：连续4个数值超过1倍标准差时失控；31s：连续3个数值超过1倍标准差时警告`
  static 失控规则名 = `41s`;
  static 警告规则名 = `31s`;

  constructor() {
    super(4)
  }
  protected 警戒次数 = 3
}
