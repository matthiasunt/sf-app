import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

const routes: Routes = [
    {path: '', redirectTo: '/tabs/find', pathMatch: 'full'},
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'find',
                children: [
                    {path: '', loadChildren: '../find/find.module#FindPageModule'},
                ]
            },
            {
                path: 'history',
                children: [
                    {path: '', loadChildren: '../history/history.module#HistoryPageModule'},
                ]
            },
            {
                path: 'favorites',
                children: [
                    {path: '', loadChildren: '../favorites/favorites.module#FavoritesPageModule'},
                ]
            }
        ]
    },
    {
        path: 'tabs/history', children: [
            {
                path: 'shuttle/:id', children: [
                    {path: '', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
                    {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'}
                ]
            },
            {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'},
        ]
    },
    {path: 'tabs/favorites/add', loadChildren: '../add/add.module#AddPageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
