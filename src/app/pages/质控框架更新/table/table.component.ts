import { Component, Input, OnInit } from '@angular/core';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';

@Component({
  selector: 'app-framework-update-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  public result = 即刻法结果

  constructor(
  ) { }

  @Input() data: 批次试验结果[]

  @Input() isLoading: boolean

  ngOnInit() {

  }
}
