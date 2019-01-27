import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsPage} from './settings.page';

const routes: Routes = [
    {path: '', component: SettingsPage},
    {path: 'blacklist', loadChildren: '../blacklist/blacklist.module#BlacklistPageModule'},
    {path: 'about', loadChildren: '../about/about.module#AboutPageModule'},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsPageRoutingModule {
}
