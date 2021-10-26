import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HbsagComponent } from './hbsag/hbsag.component';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'hbsag',
        pathMatch: 'full',
        component: HbsagComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
