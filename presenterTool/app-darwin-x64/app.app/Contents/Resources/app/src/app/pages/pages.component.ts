import { Component, OnInit } from '@angular/core';
import { MysqlService } from './mysql.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  public isVisible = false;

  constructor(
    private readonly mysqlService: MysqlService,
  ) {
  }

  ngOnInit(): void {
  }

  showModal() {
    this.isVisible = true
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
}
