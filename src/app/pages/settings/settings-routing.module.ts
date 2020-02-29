import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsPage} from './settings.page';

const routes: Routes = [
    {path: '', component: SettingsPage},
    {path: 'blacklist', loadChildren: () => import('../blacklist/blacklist.module').then(m => m.BlacklistPageModule)},
    {path: 'about', loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule)},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsPageRoutingModule {
}
