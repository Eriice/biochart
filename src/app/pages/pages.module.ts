import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { NgZorroModule } from 'src/app/ng-zorro/ng-zorro.module';
import { HbsagComponent } from './hbsag/hbsag.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzModalModule } from 'ng-zorro-antd/modal';


@NgModule({
  declarations: [
    PagesComponent,
    HbsagComponent
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
