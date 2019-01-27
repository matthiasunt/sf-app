import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FavoritesPage} from './favorites.page';

const routes: Routes = [
    {path: '', component: FavoritesPage},
    {path: 'add', loadChildren: '../add/add.module#AddPageModule'},
    {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FavoritesPageRoutingModule {
}
