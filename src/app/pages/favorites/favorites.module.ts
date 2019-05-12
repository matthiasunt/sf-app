import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FavoritesPage} from './favorites.page';
import {ComponentsModule} from '../../components/components.module';
import {TranslateModule} from '@ngx-translate/core';
import {FavoritesPageRoutingModule} from './favorites-routing.module';
import {PipesModule} from '@pipes/pipes.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        FavoritesPageRoutingModule,
        RouterModule.forChild([{path: '', component: FavoritesPage}]),
        ComponentsModule,
        PipesModule,
        TranslateModule,
    ],
    declarations: [FavoritesPage]
})
export class FavoritesPageModule {
}
