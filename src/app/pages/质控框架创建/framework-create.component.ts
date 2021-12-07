import { Component, OnInit } from '@angular/core';
import { EMPTY, forkJoin, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { 框架统计, 初始框架数据, 框架统计类型, 质控框架 } from 'src/app/database/localdb.service';
import { 即刻表数据 } from 'src/app/model/即刻表数据';
import { 试验组合 } from 'src/app/model/试验组合';
import { 求平均值, 求标准差 } from 'src/app/工具/公式';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
import { 组合状态枚举 } from 'src/app/枚举/组合状态枚举';
import { FilterQualityDataService } from '../服务/即刻法服务.service';
import { OriginalDataService } from '../服务/原始数据服务.service';
import { FrameworkDataService } from '../服务/框架数据服务.service';
import { CombinationService } from '../服务/组合服务';

@Component({
  selector: 'app-framework-create',
  templateUrl: './framework-create.component.html',
  styleUrls: ['./framework-create.component.scss']
})
export class FrameworkCreateComponent implements OnInit {

  constructor(
    private readonly 即刻法服务: FilterQualityDataService,
    private readonly 组合服务: CombinationService,
    private readonly 原始数据服务: OriginalDataService,
  ) { }

  ngOnInit(): void {
    this.订阅当前组合通知()
  }

  private 组合: 试验组合 = null
  private 框架: 质控框架 = null
  private 订阅当前组合通知() {
    this.组合服务.当前试验组合$.pipe(
      switchMap(([试验组合, 质控框架]) => {
        this.组合 = 试验组合
        this.框架 = 质控框架
        if (试验组合 === null || 质控框架 === null) {
          this.qualityData = []
          return EMPTY
        }
        this.isLoadingData = true
        const { 框架状态: 状态 } = 质控框架
        if (状态 === 组合状态枚举.已配置框架) {
          let 即刻表数据$ = from(this.原始数据服务.获取试验数据(试验组合, 质控框架)).pipe(
            switchMap(试验数据 => {
              return this.即刻法服务.使用试验数据构建框架数据(试验数据)
            })
          )
          return forkJoin([即刻表数据$, of(null)])
        } else if (状态 === 组合状态枚举.已创建框架 || 状态 === 组合状态枚举.已更新框架) {
          return forkJoin([this.即刻法服务.从本地获取框架数据(质控框架.id), this.即刻法服务.从本地获取框架(质控框架.id)])
        }
      })
    )
      .subscribe(([试验数据, 框架统计]) => {
        this.qualityData = 试验数据
        this.frameworkStatistic = 框架统计
        this.isLoadingData = false
      })
  }

  // 质控框架
  public frameworkStatistic: 框架统计 = null
  // 质控数据
  public qualityData: 即刻表数据[] = []
  // 数据是否加载中
  public isLoadingData: boolean = false

  // 非失控平均值
  private get 平均值(): number {
    const 非失控数据 = this.qualityData.filter(v => v.结果 !== 即刻法结果.失控).map(v => v['测量值/阴性值'])
    return 求平均值(非失控数据)
  }
  // 非失控标准差
  private get 标准差(): number {
    const 非失控数据 = this.qualityData.filter(v => v.结果 !== 即刻法结果.失控).map(v => v['测量值/阴性值'])
    return 求标准差(非失控数据)
  }

  createMode = 'A';

  // 是否创建中
  public isCreating: boolean = false
  async create() {
    this.isCreating = true
    if (this.框架 === null) return
    const 统计: 框架统计 = {
      创建时间: new Date(),
      平均值: this.平均值,
      标准差: this.标准差,
      框架Id: this.框架.id,
      框架统计类型: 框架统计类型.创建,
      更新截止时间: this.qualityData[this.qualityData.length - 1].创建时间,
      在控数: this.qualityData.filter(v => v.结果 === 即刻法结果.在控).length,
      警告数: this.qualityData.filter(v => v.结果 === 即刻法结果.警告).length,
      失控数: this.qualityData.filter(v => v.结果 === 即刻法结果.失控).length
    }

    await this.即刻法服务.创建初始框架(this.组合, 统计, this.qualityData)
    // 更新组合状态
    this.组合服务.更新当前试验组合(this.组合)
    this.isCreating = false
  }
}
