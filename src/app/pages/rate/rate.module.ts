import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { RatePage } from './rate.page';
import { PipesModule } from '@pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: RatePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PipesModule,
  ],
  declarations: [RatePage],
})
export class RatePageModule {}
