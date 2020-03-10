import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FindPage} from './find.page';

const routes: Routes = [
    {path: '', component: FindPage},
    {path: 'shuttle/:id', loadChildren: () => import('../shuttle/shuttle.module').then(m => m.ShuttlePageModule)},
    {
        path: 'district/:id',
        children: [
            {path: '', loadChildren: () => import('../selection/selection.module').then(m => m.SelectionPageModule)},
            {
                path: 'shuttle/:id', children: [
                    {path: '', loadChildren: () => import('../shuttle/shuttle.module').then(m => m.ShuttlePageModule)},
                    {path: 'rate/:id', loadChildren: () => import('../rate/rate.module').then(m => m.RatePageModule)}
                ]
            }
        ]
    },
    {
        path: 'gps',
        children: [
            {path: '', loadChildren: () => import('../selection/selection.module').then(m => m.SelectionPageModule)},
            {
                path: 'shuttle/:id', children: [
                    {path: '', loadChildren: () => import('../shuttle/shuttle.module').then(m => m.ShuttlePageModule)},
                    {path: 'rate/:id', loadChildren: () => import('../rate/rate.module').then(m => m.RatePageModule)}
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
