import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccessmdbService } from 'src/app/database/accessmdb.service';

@Component({
  selector: 'app-linkdb',
  templateUrl: './linkdb.component.html',
  styleUrls: ['./linkdb.component.scss']
})
export class LinkdbComponent implements OnInit {

  @Input() isVisible: boolean = false
  @Output() isVisibleChange = new EventEmitter<boolean>();
  constructor(
    private readonly 外部数据库: AccessmdbService
  ) {
  }

  ngOnInit(): void {
  }

  public MDBFilePath: string
  public providerString: string

  chooseMdb(): void {
    this.外部数据库.获取Mdb文件路径();
  }

  linkMdb(): void {
    this.外部数据库.连接数据库();
  }

  testQuery() {
    this.外部数据库.测试查询().then(res => {
      console.log("res", res)
    })
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisibleChange.emit(false)
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisibleChange.emit(false)
  }
}
