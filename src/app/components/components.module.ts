import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SfToolbarComponent } from './sf-toolbar/sf-toolbar.component';
import { SfShuttleIconComponent } from './sf-shuttle-icon/sf-shuttle-icon.component';
import { RouterModule } from '@angular/router';
import { PipesModule } from '@pipes/pipes.module';
import { SfShuttleItemComponent } from '@components/sf-shuttle-item/sf-shuttle-item.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SfShuttleIconComponent,
    SfToolbarComponent,
    SfShuttleItemComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PipesModule,
    TranslateModule,
  ],
  exports: [SfShuttleIconComponent, SfToolbarComponent, SfShuttleItemComponent],
})
export class ComponentsModule {}
