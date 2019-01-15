import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HistoryPage} from './history.page';
import {ComponentsModule} from '../../components/components.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{path: '', component: HistoryPage}]),
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [HistoryPage]
})
export class HistoryPageModule {
}
