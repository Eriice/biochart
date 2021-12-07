import { Component, OnInit } from '@angular/core';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { OriginalDataService } from '../../服务/原始数据服务.service';

@Component({
  selector: 'app-experiment-table',
  templateUrl: './experiment-table.component.html',
  styleUrls: ['./experiment-table.component.scss']
})
export class ExperimentTableComponent implements OnInit {

  constructor(
    private readonly 质控数据服务: OriginalDataService,
  ) { }

  ngOnInit(): void {
    // this.质控数据服务.试验数据$.subscribe(res => {
    //   this.listOfData = res[1]
    // })
  }

  // public listOfData: 批次试验数据[] = []

  // // 表格配置
  // checked = false;
  // indeterminate = false;
  // setOfCheckedId = new Set<string>();

  // 当前页数据: readonly 批次试验数据[] = [];

  // onCurrentPageDataChange(listOfCurrentPageData: readonly 批次试验数据[]): void {
  //   this.当前页数据 = listOfCurrentPageData;
  //   this.更新选中状态();
  // }

  // //
  // onItemChecked(id: string, checked: boolean): void {
  //   console.log("id", id)
  //   this.更新选中集合(id, checked);
  //   this.更新选中状态();
  // }

  // //
  // onAllChecked(checked: boolean): void {
  //   this.当前页数据
  //     .forEach(({ id }) => this.更新选中集合(id, checked));
  //   this.更新选中状态();
  // }

  // 更新选中集合(id: string, checked: boolean): void {
  //   if (checked) {
  //     this.setOfCheckedId.add(id);
  //   } else {
  //     this.setOfCheckedId.delete(id);
  //   }
  // }

  // 更新选中状态(): void {
  //   this.checked = this.当前页数据.every(({ id }) => this.setOfCheckedId.has(id));
  //   this.indeterminate = this.当前页数据.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  // }
}
