import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FindPage } from './find.page';
import { ComponentsModule } from '@components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { FindPageRoutingModule } from './find-routing.module';
import { PipesModule } from '@pipes/pipes.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FindPageRoutingModule,
    ComponentsModule,
    TranslateModule,
    PipesModule,
  ],
  declarations: [FindPage],
})
export class FindPageModule {}
