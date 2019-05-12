import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SfToolbarComponent} from './sf-toolbar/sf-toolbar.component';
import {SfShuttleIconComponent} from './sf-shuttle-icon/sf-shuttle-icon.component';
import {RouterModule} from '@angular/router';
import {SfSkeletonListComponent} from './sf-skeleton-list/sf-skeleton-list.component';
import {PipesModule} from '@pipes/pipes.module';


@NgModule({
    declarations: [
        SfShuttleIconComponent,
        SfToolbarComponent,
        SfSkeletonListComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        RouterModule,
        PipesModule
    ],
    exports: [
        SfShuttleIconComponent,
        SfToolbarComponent,
        SfSkeletonListComponent,
    ]
})
export class ComponentsModule {
}
