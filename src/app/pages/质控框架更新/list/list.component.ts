import { Component, Input, OnInit } from '@angular/core';
import { 框架统计 } from 'src/app/database/localdb.service';

@Component({
  selector: 'app-framework-update-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Input() data: 框架统计[]

  constructor() { }

  ngOnInit(): void {
  }

}
