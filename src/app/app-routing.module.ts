import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule'},
    {
        path: 'settings', children: [
            {path: '', loadChildren: './pages/settings/settings.module#SettingsPageModule'},
            {
                path: 'blacklist', children: [
                    {path: '', loadChildren: './pages/blacklist/blacklist.module#BlacklistPageModule'},
                    {path: 'add', loadChildren: './pages/add/add.module#AddPageModule'},
                    {path: 'add/shuttle/:id', loadChildren: './pages/shuttle/shuttle.module#ShuttlePageModule'},
                    {path: 'add/shuttle/:id/rate/:id', loadChildren: './pages/rate/rate.module#RatePageModule'},
                    {path: 'shuttle/:id', loadChildren: './pages/shuttle/shuttle.module#ShuttlePageModule'},
                    {path: 'shuttle/:id/rate/:id', loadChildren: './pages/rate/rate.module#RatePageModule'},
                ]
            },
            {path: 'about', loadChildren: './pages/about/about.module#AboutPageModule'},
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
