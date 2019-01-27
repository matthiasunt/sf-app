import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {SettingsPage} from './settings.page';
import {TranslateModule} from '@ngx-translate/core';
import {SettingsPageRoutingModule} from './settings-routing.module';

const routes: Routes = [
    {
        path: '',
        component: SettingsPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SettingsPageRoutingModule,
        RouterModule.forChild(routes),
        TranslateModule
    ],
    declarations: [SettingsPage]
})
export class SettingsPageModule {
}
