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
                    {path: '', loadChildren: '../my-sf/my-sf.module#MySfPageModule'},
                ]
            }
        ]
    },
    {path: '', redirectTo: '/tabs/find', pathMatch: 'full'},
    {
        path: 'tabs/find/district/:id',
        children: [
            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
            {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'}
        ],
    },
    {
        path: 'tabs/find/gps/:coordinates',
        children: [
            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
            {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'}
        ],
    },
    {
        path: 'tabs/history', children: [
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
