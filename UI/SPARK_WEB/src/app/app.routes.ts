import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component'; // adjust if path differs

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'nfts',
        loadComponent: () =>
          import('./modules/dashboard/pages/nft/nft.component').then(m => m.NftComponent),
      },
      { path: '', redirectTo: 'nfts', pathMatch: 'full' },
      { path: '**', redirectTo: 'nfts' },
    ],
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
