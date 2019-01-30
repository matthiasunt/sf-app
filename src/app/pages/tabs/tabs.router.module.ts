import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

const routes: Routes = [
    {path: '', redirectTo: 'tabs/find', pathMatch: 'full'},
    {
        path: 'tabs', component: TabsPage,
        children: [
            {path: 'find', loadChildren: '../find/find.module#FindPageModule'},
            {path: 'history', loadChildren: '../history/history.module#HistoryPageModule'},
            {path: 'favorites', loadChildren: '../favorites/favorites.module#FavoritesPageModule'},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
