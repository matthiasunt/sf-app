import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule'},
    {path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
