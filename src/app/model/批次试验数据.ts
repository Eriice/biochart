import { 试验批次 } from "./试验批次";
import { 试验记录 } from "./试验记录";

// 批次与记录的连表
export interface 批次试验数据 extends 试验批次, 试验记录 {
    // id?: string
    阴性值: number
    "测量值/阴性值": number
}