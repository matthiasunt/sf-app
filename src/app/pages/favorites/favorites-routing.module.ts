import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FavoritesPage} from './favorites.page';

const routes: Routes = [
    {path: '', component: FavoritesPage},
    {path: 'add', loadChildren: () => import('../add/add.module').then(m => m.AddPageModule)},
    {path: 'shuttle/:id', loadChildren: () => import('../shuttle/shuttle.module').then(m => m.ShuttlePageModule)},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FavoritesPageRoutingModule {
}
