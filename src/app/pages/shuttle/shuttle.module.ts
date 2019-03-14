import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {ShuttlePage} from './shuttle.page';
import {ComponentsModule} from '../../components/components.module';
import {ShuttlePageRoutingModule} from './shuttle-routing.module';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [
    {
        path: '',
        component: ShuttlePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ShuttlePageRoutingModule,
        RouterModule.forChild(routes),
        TranslateModule,
    ],
    declarations: [ShuttlePage]
})
export class ShuttlePageModule {
}
