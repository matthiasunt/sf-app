import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SettingsPage} from './pages/settings/settings.page';

const routes: Routes = [
    {path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule'},
    {path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule'},
    {path: 'tabs/find/selection/:id', loadChildren: './pages/selection/selection.module#SelectionPageModule'},
    {path: 'tabs/find/gps/:location', loadChildren: './pages/selection/selection.module#SelectionPageModule'},
    {path: 'about', loadChildren: './pages/about/about.module#AboutPageModule'},
    {path: 'blacklist', loadChildren: './pages/blacklist/blacklist.module#BlacklistPageModule'},
    {path: 'blacklist/add', loadChildren: './pages/add/add.module#AddPageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
