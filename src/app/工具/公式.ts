export const 求标准差 = (数据: number[]) => {
    const n = 数据.length
    const mean = 数据.reduce((累积值, 当前值) => 累积值 + 当前值) / n
    return Math.sqrt(数据.map(x => Math.pow(x - mean, 2)).reduce((累积值, 当前值) => 累积值 + 当前值) / (n - 1))
}

export const 求平均值 = (数据: number[]) => {
    const n = 数据.length
    return 数据.reduce((累积值, 当前值) => 累积值 + 当前值) / n
}


export const 保留小数 = (数字: number, n) => {
    return parseFloat(数字.toFixed(n)) 
}