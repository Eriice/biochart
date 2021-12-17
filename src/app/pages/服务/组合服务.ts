import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccessmdbService } from 'src/app/database/accessmdb.service';
import { LocaldbService, 质控框架 } from 'src/app/database/localdb.service';
import { 试验组合 } from 'src/app/model/试验组合';
import { 数据状态 } from 'src/app/枚举/数据状态';

@Injectable({
  providedIn: 'root'
})
export class CombinationService {

  constructor(
    private readonly 数据服务: AccessmdbService,
    private readonly 本地数据服务: LocaldbService
  ) { }

  private _试验组合列表 = new BehaviorSubject<[数据状态, 试验组合[]]>([数据状态.静止, []])
  试验组合列表$ = this._试验组合列表.asObservable()
  更新试验组合列表(关键字: string = "", 起止日期?: Date[]) {
    this._试验组合列表.next([数据状态.更新中, []])
    let 查询字符串 = ""
    console.log("起止日期", 起止日期)
    if (起止日期 == undefined || 起止日期.length === 0) {
      // 查询字符串 = `select 批次表.comkindcat as 试剂批号, 记录表.c_id as 样品批号 from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) where 批次表.comkindname = '${this._当前试验种类}' and 记录表.decision != 'NC' and (批次表.comkindcat like "%${关键字}%" or 记录表.c_id like "%${关键字}%") GROUP BY 批次表.comkindcat, 记录表.c_id`
      查询字符串 = `select 批次表.comkindcat as 试剂批号, 记录表.c_id as 样品批号,Max(批次表.savetime) as 时间 
      from vsscanplate as 批次表, vsscanrecord as 记录表 
      where 批次表.platename=记录表.platename and 批次表.comkindname = '${this._当前试验种类}' and 记录表.c_id like "%qc%" 
      and (批次表.comkindcat like "%${关键字}%" or 记录表.c_id like "%${关键字}%")
       GROUP BY 批次表.comkindcat, 记录表.c_id
      order by  Max(批次表.savetime) desc`
      // 查询字符串 = `select 批次表.comkindcat as 试剂批号, 记录表.c_id as 样品批号 from vsscanplate as 批次表 left join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) where 批次表.comkindname = '${this._当前试验种类}' and 记录表.decision <> 'NC' GROUP BY 批次表.comkindcat, 记录表.c_id`
    } else {
      // 查询字符串 = `select 批次表.comkindcat as 试剂批号, 记录表.c_id as 样品批号 from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) where 批次表.comkindname = '${this._当前试验种类}' and 记录表.decision != 'NC' and (批次表.comkindcat like "%${关键字}%" or 记录表.c_id like "%${关键字}%") and 批次表.savetime between FROM_UNIXTIME(${起止日期[0].valueOf() / 1000}) and FROM_UNIXTIME(${起止日期[1].valueOf() / 1000}) GROUP BY 批次表.comkindcat, 记录表.c_id`
      查询字符串 = `select 批次表.comkindcat as 试剂批号, 记录表.c_id as 样品批号 from vsscanplate as 批次表 left join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) where 批次表.comkindname like '%${this._当前试验种类}%' and 记录表.decision <> 'NC' and (批次表.comkindcat like "%${关键字}%" or 记录表.c_id like "%${关键字}%") and 批次表.savetime between FROM_UNIXTIME(${起止日期[0].valueOf() / 1000}) and FROM_UNIXTIME(${起止日期[1].valueOf() / 1000}) GROUP BY 批次表.comkindcat, 记录表.c_id`
    }
    this.数据服务.查询<试验组合[]>(查询字符串).then(v => {
      console.log("一共有", v.length, '数据')
        this._试验组合列表.next([数据状态.更新成功, v])
    })
  }

  // 所有试验种类
  private _试验种类列表 = new BehaviorSubject<string[]>([])
  试验种类列表$ = this._试验种类列表.asObservable()
  public async 设置试验种类列表() {
    let 查询字符串 = `select distinct comkindname from vsscanplate as 批次表`
    let 数据 = await this.数据服务.查询<{comkindname: string}[]>(查询字符串)
    let 试验种类列表 = 数据.map(v => v.comkindname)
    this._试验种类列表.next(试验种类列表)
    return 试验种类列表
  }

  private _当前试验种类?: string = null
  public 设置当前试验种类(试验种类?: string) {
    this._当前试验种类 = 试验种类
    this.更新当前试验组合(null)
  }
  public 获取当前试验种类() {
    return this._当前试验种类
  }

  // 组合可null
  private _当前试验组合 = new BehaviorSubject<[试验组合, 质控框架]>([null, null])
  public 当前试验组合$ = this._当前试验组合.asObservable()
  async 更新当前试验组合(组合: 试验组合 | null) {
    let 框架: 质控框架 | null = null
    if (组合 !== null) {
      框架 = await this.本地数据服务.获取质控框架(组合)
    }
    this._当前试验组合.next([组合, 框架])
  }
}