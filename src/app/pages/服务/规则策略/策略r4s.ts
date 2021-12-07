import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则枚举 } from "src/app/枚举/质控规则";
import { 质控规则策略 } from "./质控规则策略";

// export class 策略r4s extends 质控规则策略 {
//     constructor(public 数据: 批次试验结果[], readonly 平均值: number, readonly 标准差: number) {
//         super()
//         this.数据.map(v => v.结果 = 即刻法结果.在控)
//     }
//     static 描述: string;
//     static 警告规则名: string;
//     static 失控规则名: string;
//     static 规则 = 质控规则枚举["r4s"]
//     规则过滤(): 批次试验结果[] {
//         throw new Error("Method not implemented.");
//     }
// }
