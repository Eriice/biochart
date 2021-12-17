import { Component, OnInit } from '@angular/core';
// import { ipcRenderer } from 'electron';
const electron = (<any>window).require('electron');
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 试验组合 } from '../model/试验组合';
import { 数据状态 } from '../枚举/数据状态';
import { CombinationService } from './服务/组合服务';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  constructor(
    private readonly 组合服务: CombinationService,
  ) {
  }

  ngOnInit() {
    this.订阅试验种类();
    this.订阅组合更新();
    this.订阅组合列表更新();
    this.订阅关键字更新();

    electron.ipcRenderer.on("message", (event, text) => {
          console.log("arguments2", text);
          // this.tips = text;
      });
      //注意：“downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
      electron.ipcRenderer.on("downloadProgress", (event, progressObj)=> {
          console.log("progressObj", progressObj);
          // this.downloadPercent = progressObj.percent || 0;
      });
      electron.ipcRenderer.on("isUpdateNow", () => {
        electron.ipcRenderer.send("isUpdateNow");
      });
  }

  // 试验种类
  public experimentTypeList: string[] = []
  订阅试验种类() {
    this.组合服务.试验种类列表$.subscribe(res => {
      this.experimentTypeList = res
      // this.experimentTypeList = ['1111111', '1111112', '11113', '533133', '111212111', '111131132', '11113', '22224', '53333', '11121111', '11111132', '11113', '22224', '53333']
      this.组合服务.设置当前试验种类(null)
    })
  }
  public currExperimentType = this.组合服务.获取当前试验种类()
  changeExperimentType(试验种类: string) {
    this.currExperimentType = 试验种类
    this.组合服务.设置当前试验种类(试验种类)
    // 发射信号更改质控数据
    this.组合服务.更新试验组合列表()
    // 清空时间和关键词
    this.dateRange = []
    this.keywork = ""
  }

  // 日期选择
  dateRange: Date[]
  onDateRangeChange(result: Date[]) {
    this.组合服务.更新试验组合列表(this.keywork, this.dateRange)
  }
  // 模糊搜索
  keywork$ = new Subject<string>()
  keywork: string
  keyworkChange(关键词: string) {
    this.keywork$.next(关键词)
  }
  订阅关键字更新() {
    this.keywork$.pipe(debounceTime(1000)).pipe(distinctUntilChanged()).subscribe(res => {
      this.组合服务.更新试验组合列表(res, this.dateRange)
    })
  }

  // 试验组合列表
  public experimentCombineLoading = false
  public experimentCombineList: 试验组合[] = []
  订阅组合列表更新() {
    this.组合服务.试验组合列表$.subscribe(res => {
      this.experimentCombineLoading = res[0] == 数据状态.更新中
      this.experimentCombineList = res[1]
    })
  }

  // 当前试验组合
  public currExperimentCombine: 试验组合 = null
  // 切换试验组合
  experimentCombineChange(试剂批号: string, 样品批号: string) {
    this.组合服务.更新当前试验组合({ 试剂批号, 样品批号 })
  }
  订阅组合更新() {
    this.组合服务.当前试验组合$.subscribe(([试验组合]) => {
      this.currExperimentCombine = 试验组合
    })
  }

  // 连接数据库模态框
  public isLinkDbVisible = false;
  showModal() {
    this.isLinkDbVisible = true
  }

  updateSoft() {
    electron.ipcRenderer.send('checkForUpdate')
  }
}
