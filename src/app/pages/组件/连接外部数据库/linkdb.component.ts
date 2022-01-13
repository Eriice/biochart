import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccessmdbService } from 'src/app/database/accessmdb.service';
import { CombinationService } from '../../服务/组合服务';
import { NzMessageService } from 'ng-zorro-antd/message'
import { LocaldbService } from 'src/app/database/localdb.service';

@Component({
  selector: 'app-linkdb',
  templateUrl: './linkdb.component.html',
  styleUrls: ['./linkdb.component.scss']
})
export class LinkdbComponent  {

  @Input() isVisible: boolean = false
  @Output() isVisibleChange = new EventEmitter<boolean>();
  constructor(
    private readonly 外部数据库: AccessmdbService,
    private readonly 本地数据库: LocaldbService,
    private readonly 组合服务: CombinationService,
    private readonly 全局信息服务: NzMessageService
  ) {
  }

  ngOnChanges() {
    // 待办 不同连接字符串的数据库应该视为不同数据库，假如使用不同数据库，后续方向应该新增标识区分数据库 
    this.linkStatus = this.外部数据库.是否已经连接数据库
    console.log("this.linkStatus", this.linkStatus)
  }

  public MDBFilePath: string = null
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
      // 记录连接字符串
      let 数据库连接 = {
        创建时间: new Date(),
        连接字符串: this.外部数据库.连接字符串
      }
      this.本地数据库.新增数据库连接(数据库连接)

      this.linkStatus = true
    } catch(err) {
      this.全局信息服务.error('数据库连接异常')
      console.log(err)
      this.linkStatus = false
    }
  }

  handleOk(): void {
    this.isVisibleChange.emit(false)
  }

  handleCancel(): void {
    this.isVisibleChange.emit(false)
  }
}
