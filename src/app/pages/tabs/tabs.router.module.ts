import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'find',
                children: [
                    {path: '', loadChildren: '../find/find.module#FindPageModule'},
                    {
                        path: 'district/:id',
                        children: [
                            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
                            {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'}
                        ],
                    },
                    {
                        path: 'gps/:coordinates',
                        children: [
                            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
                            {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'}
                        ],
                    },
                ]
            },
            {
                path: 'history',
                children: [
                    {path: '', loadChildren: '../history/history.module#HistoryPageModule'},
                    {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'},
                ]
            },
            {
                path: 'favorites',
                children: [
                    {path: '', loadChildren: '../favorites/favorites.module#FavoritesPageModule'},
                    {path: 'add', loadChildren: '../add/add.module#AddPageModule'},
                ]
            },
            {
                path: '', redirectTo: '/tabs/find', pathMatch: 'full'
            }
        ]
    },
    {path: '', redirectTo: '/tabs/find', pathMatch: 'full'},


    {path: 'settings', loadChildren: '../settings/settings.module#SettingsPageModule'},
    {path: 'settings/blacklist', loadChildren: '../blacklist/blacklist.module#BlacklistPageModule'},
    {path: 'settings/blacklist/add', loadChildren: '../add/add.module#AddPageModule'},
    {path: 'settings/about', loadChildren: '../about/about.module#AboutPageModule'},


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule {
}
