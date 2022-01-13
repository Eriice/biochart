import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { 批次试验数据 } from 'src/app/model/批次试验数据';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';
import * as XLSX from 'xlsx';

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

  @ViewChild('table', { read: ElementRef }) 题干元素: ElementRef;

  ngOnInit() {

  }

  export() {
    let data = [
      ["表格1", "表格2", "表格3"],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    let table = this.题干元素.nativeElement
    var workbook = XLSX.utils.table_to_book(table);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(workbook, 'SheetJS.xlsx');
  }
}
