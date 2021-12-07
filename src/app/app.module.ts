import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserComponent } from './browser/browser.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { NgZorroModule } from './ng-zorro/ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';
import { NgxEchartsModule } from 'ngx-echarts';

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    BrowserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    IconsProviderModule,
    // NgZorroModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    { provide: "组合分隔符", useValue: "@#@" }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
