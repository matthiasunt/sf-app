import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectionPage } from './selection.page';
import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@pipes/pipes.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [
  {
    path: '',
    component: SelectionPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    PipesModule,
    ScrollingModule,
  ],
  declarations: [SelectionPage],
})
export class SelectionPageModule {}
