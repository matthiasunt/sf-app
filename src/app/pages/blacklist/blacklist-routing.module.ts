import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BlacklistPage} from './blacklist.page';

const routes: Routes = [
    {path: '', component: BlacklistPage},
    {path: 'add', loadChildren: '../add/add.module#AddPageModule'},
    {path: 'shuttle/:id', loadChildren: '../shuttle/shuttle.module#ShuttlePageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BlacklistPageRoutingModule {
}
