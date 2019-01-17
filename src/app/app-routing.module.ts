import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule'},
    {path: 'tabs/find/district/:id', loadChildren: './pages/selection/selection.module#SelectionPageModule'},
    {path: 'tabs/find/gps/:coordinates', loadChildren: './pages/selection/selection.module#SelectionPageModule'},
    {path: 'tabs/favorites/add', loadChildren: './pages/add/add.module#AddPageModule'},
    {path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule'},
    {path: 'settings/blacklist', loadChildren: './pages/blacklist/blacklist.module#BlacklistPageModule'},
    {path: 'settings/blacklist/add', loadChildren: './pages/add/add.module#AddPageModule'},
    {path: 'settings/about', loadChildren: './pages/about/about.module#AboutPageModule'},
    {path: 'tabs/find/district/:id/shuttle/:id', loadChildren: './pages/shuttle/shuttle.module#ShuttlePageModule'},
    {path: 'tabs/find/gps/:coordinates/shuttle/:id', loadChildren: './pages/shuttle/shuttle.module#ShuttlePageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
