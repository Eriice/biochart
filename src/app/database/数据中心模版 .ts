
export abstract class 数据中心模版 {
    // 是否已经连接数据库
    abstract isLinkDB: boolean

    public abstract 连接数据库(): void

    public abstract 查询(sql: string): Promise<any>

    public abstract 测试查询(): Promise<any>

}