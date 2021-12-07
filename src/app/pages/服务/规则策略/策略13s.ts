import { 批次试验数据 } from "src/app/model/批次试验数据";
import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则策略, 质控规则策略接口 } from "./质控规则策略";

export class 策略13s extends 质控规则策略 implements 质控规则策略接口 {
  constructor() {
    super()
  }

  static 描述 = "13s：数值超过3倍标准差时失控；12s：数值超过2倍标准差时警告"
  static 警告规则名 = "12s";
  static 失控规则名 = "13s";

  private 警告过滤 = () => {
    this._结果.map(v => {
      if (Math.abs(v["测量值/阴性值"] - this.平均值) > this.标准差 * 2) {
        v.结果 = 即刻法结果.警告
      }
    })
  };
  private 失控过滤 = () => {
    this._结果.map(v => {
      if (Math.abs(v["测量值/阴性值"] - this.平均值) > this.标准差 * 3) {
        v.结果 = 即刻法结果.警告
      }
    })
  };

  规则过滤(): 批次试验结果[] {
    this.警告过滤()
    this.失控过滤()
    return this._结果
  }

  数据: 批次试验数据[]
  private _结果: 批次试验结果[] = []
  平均值: number
  标准差: number

  设置数据(数据: 批次试验数据[], 平均值: number, 标准差: number) {
    this.数据 = 数据
    this.平均值 = 平均值
    this.标准差 = 标准差
    // 所有默认在控，当超过2s标记为警告，超过3s标记为失控
    this._结果 = this.数据.map(v => {
      return { ...v, 结果: 即刻法结果.在控 }
    })
  }
}

let 策略13s函数 = (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number) => {
  const 当前值 = 数据[索引]["测量值/阴性值"]
  if (Math.abs(当前值 - 平均值) > 标准差 * 3) {
    return 即刻法结果.失控
  }
  if (Math.abs(当前值 - 平均值) > 标准差 * 2) {
    return 即刻法结果.警告
  }
  return 即刻法结果.在控
}



