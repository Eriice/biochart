import { Component, OnInit } from '@angular/core';
import { EMPTY, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { FrameworkDataService } from '../服务/框架数据服务.service';
import { OriginalDataService } from '../服务/原始数据服务.service';
import { CombinationService } from '../服务/组合服务';
import { 框架统计 } from 'src/app/database/localdb.service';
import { 组合状态枚举 } from 'src/app/枚举/组合状态枚举';

type 试验数据 = 批次试验数据 | 批次试验结果

@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss']
})
export class WatchComponent implements OnInit {
  constructor(
    private readonly 原始数据服务: OriginalDataService,
    private readonly 质控数据服务: FrameworkDataService,
    private readonly 组合服务: CombinationService
  ) { }

  ngOnInit(): void {
    this.订阅当前组合通知()
  }

  // 如果数据加载中，禁止再次搜索
  public isLoading: boolean
  private 质控数据: 试验数据[] = []
  public filterQualityData: 试验数据[] = []
  // 框架统计
  public frameworkStatistic: 框架统计 = null
  订阅当前组合通知() {
    this.组合服务.当前试验组合$.pipe(
      switchMap(([试验组合, 质控框架]) => {
        if (试验组合 === null || 质控框架 === null) return EMPTY
        const { 框架状态: 状态 } = 质控框架
        if (状态 === 组合状态枚举.已配置框架) {
          return forkJoin([this.原始数据服务.获取试验数据(试验组合, 质控框架), of(null)])
        } else {
          return forkJoin([this.质控数据服务.获取框架数据(质控框架.id, 试验组合), this.质控数据服务.获取最新框架统计(质控框架.id)])
        }
      }),
    ).subscribe(([试验数据, 框架统计]) => {
      this.质控数据 = 试验数据
      // this.frameworkStatistic = 框架统计
      this.reset()
    })
  }

  // 日期范围
  public dateRange: Date[] = null;
  search() {
    // 筛选时间
    if (this.dateRange === null) {
      this.filterQualityData = this.质控数据
    } else {
      this.filterQualityData = this.质控数据.filter(v => {
        return v.创建时间.valueOf() >= this.dateRange[0].valueOf() && v.创建时间.valueOf() <= this.dateRange[1].valueOf()
      })
    }
  }

  // 重置搜索条件
  reset() {
    this.dateRange = []
    this.filterQualityData = this.质控数据
  }
}
