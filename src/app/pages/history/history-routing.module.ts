import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HistoryPage} from './history.page';

const routes: Routes = [
    {path: '', component: HistoryPage},
    {path: 'rate', loadChildren: '../rate/rate.module#RatePageModule'},
    {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HistoryPageRoutingModule {
}
