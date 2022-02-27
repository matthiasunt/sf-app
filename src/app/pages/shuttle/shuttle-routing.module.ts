import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShuttlePage } from './shuttle.page';

const routes: Routes = [
  { path: '', component: ShuttlePage },
  {
    path: 'rate/:id',
    loadChildren: () =>
      import('../rate/rate.module').then((m) => m.RatePageModule),
  },
  {
    path: 'ratings/:id',
    loadChildren: () =>
      import('../ratings/ratings.module').then((m) => m.RatingsPageModule),
  },
  {
    path: 'ratings/:id/rate/:id',
    loadChildren: () =>
      import('../rate/rate.module').then((m) => m.RatePageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShuttlePageRoutingModule {}
