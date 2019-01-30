import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SfToolbarComponent} from './sf-toolbar/sf-toolbar.component';
import {SfShuttleIconComponent} from './sf-shuttle-icon/sf-shuttle-icon.component';
import {RouterModule} from '@angular/router';
import {SfSkeletonListComponent} from './sf-skeleton-list/sf-skeleton-list.component';


@NgModule({
    declarations: [
        SfShuttleIconComponent,
        SfToolbarComponent,
        SfSkeletonListComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        RouterModule
    ],
    exports: [
        SfShuttleIconComponent,
        SfToolbarComponent,
        SfSkeletonListComponent
    ]
})
export class ComponentsModule {
}
