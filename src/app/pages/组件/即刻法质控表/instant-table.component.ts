import { Component, Input, OnInit } from '@angular/core';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
import { 即刻表数据 } from '../../../model/即刻表数据';


@Component({
  selector: 'app-instant-table',
  templateUrl: './instant-table.component.html',
  styleUrls: ['./instant-table.component.scss']
})
export class InstantTableComponent {

  public A = 即刻法结果

  @Input() listOfData: 即刻表数据[] = [];

  constructor(
  ) { }
}
