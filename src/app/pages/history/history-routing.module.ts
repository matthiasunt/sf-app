import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryPage } from './history.page';

const routes: Routes = [
  { path: '', component: HistoryPage },
  {
    path: 'rate/:id',
    loadChildren: () =>
      import('../rate/rate.module').then((m) => m.RatePageModule),
  },
  {
    path: 'shuttle/:id',
    loadChildren: () =>
      import('../shuttle/shuttle.module').then((m) => m.ShuttlePageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoryPageRoutingModule {}
