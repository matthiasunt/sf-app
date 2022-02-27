import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BlacklistPage } from './blacklist.page';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@components/components.module';
import { BlacklistPageRoutingModule } from './blacklist-routing.module';
import { PipesModule } from '@pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: BlacklistPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlacklistPageRoutingModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    PipesModule,
  ],
  declarations: [BlacklistPage],
})
export class BlacklistPageModule {}
