import { Component, Input, OnInit } from '@angular/core';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';

@Component({
  selector: 'app-quality-table',
  templateUrl: './quality-table.component.html',
  styleUrls: ['./quality-table.component.scss']
})
export class QualityTableComponent implements OnInit {

  constructor(
  ) { }

  public A = 即刻法结果

  @Input() data: (批次试验数据 | 批次试验结果)[]

  @Input() isLoading: boolean

  ngOnInit() {

  }
}
