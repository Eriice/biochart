import { Component, OnInit } from '@angular/core';
import { 框架统计, 质控框架 } from 'src/app/database/localdb.service';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { FrameworkDataService } from '../服务/框架数据服务.service';
import { CombinationService } from '../服务/组合服务';
import { 试验组合 } from 'src/app/model/试验组合';
import { switchMap } from 'rxjs/operators';
import { EMPTY, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-framework-update',
  templateUrl: './framework-update.component.html',
  styleUrls: ['./framework-update.component.scss']
})
export class FrameworkUpdateComponent implements OnInit {

  constructor(
    private readonly 组合服务: CombinationService,
    private readonly 框架数据服务: FrameworkDataService,
    private readonly 通知服务: NzNotificationService,
  ) {
  }

  ngOnInit(): void {
    this.订阅当前组合通知()
  }

  private 组合: 试验组合
  private 框架: 质控框架
  // private 质控数据: 批次试验结果[] = []
  public frameworkStatistic: 框架统计 = null
  public frameworkList: 框架统计[] = []
  public isLoadingData: boolean = false
  订阅当前组合通知() {
    this.组合服务.当前试验组合$.pipe(
      switchMap(([试验组合, 质控框架]) => {
        if (试验组合 === null || 质控框架 === null) return EMPTY
        this.isLoadingData = true
        this.组合 = 试验组合
        this.框架 = 质控框架
        return forkJoin([
          this.框架数据服务.获取最新框架统计(质控框架.id),
          this.框架数据服务.获取框架统计列表(质控框架.id)
        ])
      })
    ).subscribe(([框架统计, 统计列表]) => {
      // this.质控数据 = 试验数据
      this.frameworkStatistic = 框架统计
      this.frameworkList = 统计列表
      this.preview()
      this.isLoadingData = false
    })
  }

  // 可被更新数据
  public canbeUpdateData: 批次试验结果[] = []
  // 截止时间 - 默认当天
  public expirationDate: Date = new Date()
  // 预览
  preview() {
    this.canBeUpdated = true
    let 截止时间 = moment(this.expirationDate).add(1, 'days').toDate()
    this.canbeUpdateData = this.框架数据服务.获取可更新数据(截止时间)
  }
  public canBeUpdated: boolean = false
  // 更新框架
  async updateFramework() {
    // 判断能否更新
    if (!this.判断是否能更新()) {
      return
    }
    let 截止时间 = moment(this.expirationDate).add(1, 'days').toDate()
    await this.框架数据服务.创建滚动框架(this.框架.id, 截止时间)
    await this.组合服务.更新当前试验组合(this.组合)
    this.canBeUpdated = false
    this.preview()
  }

  判断是否能更新() {
    // 截止时间不得小于最后一次更新时间
    let 当前截止时间 = moment(this.expirationDate).add(1, 'days').toDate()
    let 上次截止时间 = this.frameworkList[this.frameworkList.length - 1].更新截止时间
    if (当前截止时间 < 上次截止时间) {
      this.通知服务
        .blank(
          '更新失败',
          '截止时间不能少于最后一次的更新截止时间'
        )
      return false
    }

    if (this.canbeUpdateData.length === 0) {
      this.通知服务
        .blank(
          '更新失败',
          '没有可以更新的数据'
        )
      return false
    }
    return true
  }
}