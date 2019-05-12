import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {SettingsPage} from './settings.page';
import {TranslateModule} from '@ngx-translate/core';
import {SettingsPageRoutingModule} from './settings-routing.module';
import {PipesModule} from '@pipes/pipes.module';

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
        TranslateModule,
        PipesModule
    ],
    declarations: [SettingsPage]
})
export class SettingsPageModule {
}
