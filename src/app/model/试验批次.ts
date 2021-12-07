// 来自数据表结构
export interface 试验批次 {
    // platename
    批次: string
    // savetime
    创建时间: Date
    reportid: string
    // comkindname
    试剂名: string
    // comkindcat
    试剂批号: string
    comappratus?: string
    // comcheckdoctor
    操作人: string
    comtempera: string
    comhumidity: string
    commethod: string
    comwavelength: string
}