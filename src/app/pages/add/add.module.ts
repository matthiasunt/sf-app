import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {AddPage} from './add.page';
import {TranslateModule} from '@ngx-translate/core';
import {ComponentsModule} from '../../components/components.module';
import {AddPageRoutingModule} from './add-routing.module';

const routes: Routes = [
    {
        path: '',
        component: AddPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddPageRoutingModule,
        RouterModule.forChild(routes),
        TranslateModule,
        ComponentsModule,
    ],
    declarations: [AddPage]
})
export class AddPageModule {
}
