import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryPage } from './history.page';
import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryPageRoutingModule } from './history-routing.module';
import { PipesModule } from '@pipes/pipes.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HistoryPageRoutingModule,
    RouterModule.forChild([{ path: '', component: HistoryPage }]),
    ComponentsModule,
    PipesModule,
    TranslateModule,
    ScrollingModule,
  ],
  declarations: [HistoryPage],
})
export class HistoryPageModule {}
