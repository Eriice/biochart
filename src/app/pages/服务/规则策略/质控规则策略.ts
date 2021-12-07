import { 批次试验数据 } from "src/app/model/批次试验数据";
import { 批次试验结果 } from "src/app/model/批次试验结果";
import { 即刻法结果 } from "src/app/枚举/即刻法结果";
import { 质控规则枚举 } from "src/app/枚举/质控规则";

// export class 质控规则策略 {
//   static 描述: string
//   static 失控规则名: string
//   static 警告规则名: string

//   // 复合规则运算
//   protected 失控警戒值: number
//   protected 警告警戒值: number
//   protected 是否超过警戒线: (...args: any[]) => boolean
//   // 按位运算，超过警戒线记为1，不超为0
//   protected 计算前n条是否超过警戒线 = (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number, n: number) => {
//     let 总数 = 0;
//     let 非失控条数 = 0;
//     // i 可以大于 n
//     let i = 0;

//     // 对于存在失控数据，则需要跳过失控数据 
//     while (非失控条数 < n && i < 数据.length) {
//       let 当前数据 = 数据[索引 - 1 - i]
//       if (当前数据.结果 !== 即刻法结果.失控) {
//         if (this.是否超过警戒线(当前数据["测量值/阴性值"], 平均值, 标准差)) {
//           总数 += 2 ** 非失控条数
//         }
//         非失控条数++
//       }
//       i++
//     }
//     return 总数
//   }

//   public 复合策略函数 = (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number) => {
//     const 当前值 = 数据[索引]["测量值/阴性值"]

//     const 位值 = this.计算前n条是否超过警戒线(数据, 索引, 平均值, 标准差, this.n)
//     if (位值 >= this.失控警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//       return 即刻法结果.失控
//     }

//     if (位值 >= this.警告警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//       return 即刻法结果.警告
//     }

//     return 即刻法结果.在控
//   }
// }

export interface 质控规则策略接口 {
  数据: 批次试验数据[]
  平均值: number
  标准差?: number
  规则过滤(): 批次试验结果[]
  设置数据(数据: 批次试验数据[], 平均值: number, 标准差?: number)
}

export interface 质控规则接口 {
  计算即刻法结果(索引: number): 即刻法结果
}

// 属于层次规则类，达到某个层次，则警告/失控
export class 规则13s implements 质控规则接口 {
  constructor(protected 数据: 批次试验结果[], protected 平均值: number, protected 标准差: number) {
  }
  private 是否失控 = (索引: number) => {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    return Math.abs(当前值 - this.平均值) > this.标准差 * 3
  }
  private 是否警告 = (索引: number) => {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    return Math.abs(当前值 - this.平均值) > this.标准差 * 2
  }
  计算即刻法结果(索引: number) {
    if (this.是否失控(索引)) {
      return 即刻法结果.失控
    }
    if (this.是否警告(索引)) {
      return 即刻法结果.警告
    }
    return 即刻法结果.在控
  }
}


export abstract class 累次规则基类 implements 质控规则接口 {
  // n: 达到失控累计超过警戒线次数
  constructor(protected 数据: 批次试验结果[], protected 平均值: number, protected 标准差: number, protected n: number) {
  }

  get 失控警戒值() {
    return (2 ** (this.n)) - 1
  }
  get 警告警戒值() {
    return (2 ** (this.n - 1)) - 1
  }

  // abstract 是否超过警戒线(...args: any[]): boolean
  abstract 是否超过警戒线(索引: number): boolean

  protected 计算前n条警戒值 = (索引: number) => {
    let 警戒值 = 0;
    let 非失控条数 = 0;
    // i 可以大于 n
    let i = 0;

    // 对于存在失控数据，则需要跳过失控数据 
    while (非失控条数 < this.n && i < this.数据.length) {
      let 当前索引 = 索引 - i
      if (当前索引 < 0) {
        非失控条数++
        continue
      }
      // 从倒数第二条开始判断
      let 当前记录 = this.数据[当前索引]
      // 只将非失控结果纳入考虑
      if (当前记录.结果 !== 即刻法结果.失控) {
        // 超过警戒线累计
        if (this.是否超过警戒线(当前索引)) {
          警戒值 += 2 ** 非失控条数
        }
        非失控条数++
      }
      i++
    }
    return 警戒值
  }

  public 计算即刻法结果 = (索引: number) => {
    const 警戒值 = this.计算前n条警戒值(索引)
    let 索引结果 = this.数据[索引].结果
    if (索引结果 === null || 索引结果 === 即刻法结果.在控) {
      // 不能大于等于，否则第一个超过警戒值，就会必定发生警告
      if (警戒值 === this.失控警戒值) return 即刻法结果.失控
      if (警戒值 === this.警告警戒值) return 即刻法结果.警告
      return 即刻法结果.在控
    } else {
      if (索引结果 === 即刻法结果.失控) return 即刻法结果.失控
      if (索引结果 === 即刻法结果.警告) {
        if (警戒值 === this.失控警戒值) return 即刻法结果.失控
        return 即刻法结果.警告
      }
    }
  }
}

export class 规则22s extends 累次规则基类 {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 2)
  }
  是否超过警戒线(索引: number) {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    return Math.abs(当前值 - this.平均值) > this.标准差 * 2
  }
}

export class 规则31s extends 累次规则基类 {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 3)
  }
  是否超过警戒线(索引: number) {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    return Math.abs(当前值 - this.平均值) > this.标准差 * 1
  }
}

export class 规则41s extends 累次规则基类 {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 4)
  }
  是否超过警戒线(索引: number) {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    return Math.abs(当前值 - this.平均值) > this.标准差 * 1
  }
}

class 规则nx extends 累次规则基类 {
  private 最末数据索引: number = 0
  private 最末数据是否大于平均值: boolean = true
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number, n) {
    super(数据, 平均值, 标准差, n)
  }
  是否超过警戒线(索引: number) {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    if (索引 > this.最末数据索引) {
      this.最末数据索引 = 索引
      this.最末数据是否大于平均值 = 当前值 > this.平均值
      return true
    }

    if (this.最末数据是否大于平均值) {
      return 当前值 > this.平均值
    } else {
      return 当前值 < this.平均值
    }
  }
}

export class 规则7x extends 规则nx {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 7)
  }
}
export class 规则8x extends 规则nx {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 8)
  }
}
export class 规则9x extends 规则nx {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 9)
  }
}
export class 规则10x extends 规则nx {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 10)
  }
}
export class 规则12x extends 规则nx {
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 12)
  }
}

// 7t 特殊之处在于，警戒值只需要考量6次，因为第六次结果就包含了两个点的大小关系
export class 规则7t extends 累次规则基类 {
  private 最末数据索引: number = 0
  private 最末数据趋势是否向上: boolean = true
  constructor(数据: 批次试验结果[], 平均值: number, 标准差: number) {
    super(数据, 平均值, 标准差, 6)
  }
  是否超过警戒线(索引: number) {
    const 当前值 = this.数据[索引]["测量值/阴性值"]
    if ((索引 - 1) < 0) {
      // 若上一个值不可比，则认为当前值没有超过警戒线
      return false
    }

    const 上一个值 = this.数据[索引 - 1]["测量值/阴性值"]

    if (索引 > this.最末数据索引) {
      this.最末数据索引 = 索引
      this.最末数据趋势是否向上 = 当前值 > 上一个值
      return true
    }

    if (this.最末数据趋势是否向上) {
      return 当前值 > 上一个值
    } else {
      return 当前值 < 上一个值
    }
  }
}


// 难点，使用策略模式不能约束类上的静态元素
// 使用抽象类不能实例化 var a: typeof Fun = B Fun 为抽象类
// 使用实体类

// interface Fun {
//   getName(): void
// }

// class A{
//   static A: string
// }

// class B extends A  implements Fun  {
//   getName(): void {
//     throw new Error("Method not implemented.");
//   }
// }

// class C extends A  implements Fun  {
//   getName(): void {
//     throw new Error("Method not implemented.");
//   }
// }

// var a: typeof A = B

// function createInstance<T>(c: new() => T) {}
// createInstance<Fun>(a)
// var c = new a() as Fun

// c.getName()

// type 基类 = {
//   计算前n条是否超过警戒线: (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number, n: number) => number
// }

// export interface 质控规则之次数类型接口 extends 质控规则接口 {
//   // 失控累计次数
//   n: number
//   readonly 失控警戒值: number
//   readonly 警告警戒值: number
//   是否超过警戒线: (...args: any[]) => boolean
// }


// let 规则22s: 质控规则之次数类型接口 = {
//   n: 2,
//   get 失控警戒值() {
//     return (2 ** this.n - 1) - 1
//   },
//   get 警告警戒值() {
//     return (2 ** this.n - 2) - 1
//   },
//   // 警戒线2s判定策略
//   是否超过警戒线: (当前值: number, 平均值: number, 标准差: number) => {
//     return Math.abs(当前值 - 平均值) > 标准差 * 2
//   },
//   计算即刻法结果:  (数据: 批次试验结果[], 索引: number, 平均值: number, 标准差: number) => {
//     const 当前值 = 数据[索引]["测量值/阴性值"]

//     const 位值 = this.计算前n条是否超过警戒线(数据, 索引, 平均值, 标准差, this.n)
//     if (位值 >= this.失控警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//       return 即刻法结果.失控
//     }

//     if (位值 >= this.警告警戒值 && this.是否超过警戒线(当前值, 平均值, 标准差)) {
//       return 即刻法结果.警告
//     }

//     return 即刻法结果.在控
//   }
// }