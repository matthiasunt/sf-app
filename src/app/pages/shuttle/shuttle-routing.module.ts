import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShuttlePage} from './shuttle.page';

const routes: Routes = [
    {path: '', component: ShuttlePage},
    {path: 'rate/:id', loadChildren: '../rate/rate.module#RatePageModule'},
    {path: 'ratings/:id', loadChildren: '../ratings/ratings.module#RatingsPageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShuttlePageRoutingModule {
}
