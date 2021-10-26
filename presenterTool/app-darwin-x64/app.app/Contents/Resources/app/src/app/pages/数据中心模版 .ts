
export abstract class 数据中心模版 {
    // 是否已经连接数据库
    abstract isLinkDB: boolean

    protected abstract 连接数据库(): void

    protected abstract 查询(sql: string): Promise<any>

}