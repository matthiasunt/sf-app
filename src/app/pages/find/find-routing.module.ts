import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FindPage} from './find.page';

const routes: Routes = [
    {path: '', component: FindPage},
    {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
    {
        path: 'district/:id',
        children: [
            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
            {
                path: 'shuttle/:id', children: [
                    {path: '', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
                    {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'}
                ]
            }
        ]
    },
    {
        path: 'gps',
        children: [
            {path: '', loadChildren: '../selection/selection.module#SelectionPageModule'},
            {
                path: 'shuttle/:id', children: [
                    {path: '', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
                    {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'}
                ]
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FindPageRoutingModule {
}
