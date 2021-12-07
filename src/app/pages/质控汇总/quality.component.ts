import { Component, OnInit } from '@angular/core';
import { 质控框架 } from 'src/app/database/localdb.service';
import { 试验组合 } from 'src/app/model/试验组合';
import { CombinationService } from '../服务/组合服务';
import * as _ from 'lodash'

@Component({
  selector: 'app-quality',
  templateUrl: './quality.component.html',
  styleUrls: ['./quality.component.scss']
})
export class QualityComponent implements OnInit {

  constructor(
    private readonly 组合服务: CombinationService,
  ) {
    this.订阅当前组合通知()
  }

  ngOnInit(): void {
  }

  public currentCombination: 试验组合 = null
  public framework: 质控框架 = null
  订阅当前组合通知() {
    // 试验组合变更时候更新试验全局试验数据
    this.组合服务.当前试验组合$.subscribe(([试验组合, 质控框架]) => {
      if (_.isEqual(this.currentCombination, 试验组合) === false) {
        // 重置 tab
        this.currTab = 0
      }
      this.currentCombination = 试验组合
      this.framework = 质控框架
    })
  }

  // 查看配置
  public isCheckConfig: boolean = false
  initConfig() {
    this.isCheckConfig = true
  }

  handleOk() {
    this.isCheckConfig = false
  }

  // 当前 tab
  public currTab = 0
  public tabs = ["质控数据", "创建质控框架", "更新质控框架"]
}
