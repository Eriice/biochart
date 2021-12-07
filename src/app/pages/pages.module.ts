import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { NgZorroModule } from 'src/app/ng-zorro/ng-zorro.module';
import { WatchComponent } from './质控数据监测/watch.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { QualityComponent } from './质控汇总/quality.component';
import { WithFrameworkComponent } from './组件/带框架质控图/with-framework.component';
import { WithoutFrameworkComponent } from './组件/无框架质控图/without-framework.component';
import { ExperimentTableComponent } from './质控框架创建/试验数据操作表/experiment-table.component';
import { QualityTableComponent } from './组件/试验数据展示表/quality-table.component';
import { InstantTableComponent } from './组件/即刻法质控表/instant-table.component';
import { FrameworkCreateComponent } from './质控框架创建/framework-create.component';
import { FrameworkUpdateComponent } from './质控框架更新/framework-update.component';
import { TableComponent } from './质控框架更新/table/table.component';
import { ListComponent } from './质控框架更新/list/list.component';
import { LinkdbComponent } from './组件/连接外部数据库/linkdb.component';
import { FrameworkConfigComponent } from './质控框架配置/framework-config.component';

@NgModule({
  declarations: [
    PagesComponent,
    WatchComponent,
    QualityComponent,
    InstantTableComponent,
    WithFrameworkComponent,
    WithoutFrameworkComponent,
    ExperimentTableComponent,
    QualityTableComponent,
    QualityTableComponent,
    FrameworkCreateComponent,
    FrameworkUpdateComponent,
    TableComponent,
    ListComponent,
    LinkdbComponent,
    FrameworkConfigComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    NgZorroModule,
    NzModalModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],

})
export class PagesModule { }
