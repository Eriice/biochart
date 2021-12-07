import { 即刻法结果 } from "../枚举/即刻法结果";

// 系统通用数据
export interface 批次试验结果 {
    // 批次信息
    批次: string
    // 试剂名: string
    // 试剂批号: string
    创建时间: Date

    // 试验信息
    测量值: number
    阴性值: number
    "测量值/阴性值": number
    // 样品批号: string
    行号: number
    列号: number
    操作人: string
    结果: 即刻法结果
}