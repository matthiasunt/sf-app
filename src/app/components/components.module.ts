import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SfToolbarComponent} from './sf-toolbar/sf-toolbar.component';
import {SfShuttleIconComponent} from './sf-shuttle-icon/sf-shuttle-icon.component';
import {RouterModule} from '@angular/router';


@NgModule({
    declarations: [
        SfShuttleIconComponent,
        SfToolbarComponent,
    ],
    imports: [
        IonicModule,
        RouterModule
    ],
    exports: [
        SfShuttleIconComponent,
        SfToolbarComponent,
    ]
})
export class ComponentsModule {
}
