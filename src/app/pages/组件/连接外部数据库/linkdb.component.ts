import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccessmdbService } from 'src/app/database/accessmdb.service';
import { CombinationService } from '../../服务/组合服务';
import { NzMessageService } from 'ng-zorro-antd/message'

@Component({
  selector: 'app-linkdb',
  templateUrl: './linkdb.component.html',
  styleUrls: ['./linkdb.component.scss']
})
export class LinkdbComponent implements OnInit {

  @Input() isVisible: boolean = false
  @Output() isVisibleChange = new EventEmitter<boolean>();
  constructor(
    private readonly 外部数据库: AccessmdbService,
    private readonly 组合服务: CombinationService,
    private readonly 全局信息服务: NzMessageService
  ) {
  }

  ngOnInit(): void {
  }

  public MDBFilePath: string
  public providerString: string

  async chooseMdb() {
    this.MDBFilePath = await this.外部数据库.获取Mdb文件路径();
    this.外部数据库.连接数据库();
  }

  public linkStatus = false
  // 使用获取试验种类进行数据库联通性测试
  async linkMdb() {
    try {
      await this.组合服务.设置试验种类列表()
      this.全局信息服务.success('数据库连接成功')
      this.linkStatus = true
    } catch(err) {
      this.全局信息服务.error('数据库连接异常')
      console.log(err)
      this.linkStatus = false
    }
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
