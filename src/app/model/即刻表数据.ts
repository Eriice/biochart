import { 即刻法结果 } from "src/app/枚举/即刻法结果";

export interface 即刻表数据 {
    序号: number;
    批次: string;
    创建时间: Date;
    操作人: string;
    测量值: number;
    阴性值: number;
    '测量值/阴性值': number;
    n3s?: number;
    n2s?: number;
    SI上限?: number;
    SI下限?: number;
    结果: 即刻法结果;
    行号: number;
    列号: number;
}