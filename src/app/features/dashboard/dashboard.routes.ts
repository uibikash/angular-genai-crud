import { Routes } from '@angular/router';
import { UserDashboardComponent } from '../../components/user-dashboard/user-dashboard';
import { ItemManagerComponent } from '../../components/item-manager/item-manager';
import { authGuard } from '../../guards/auth.guard';
import { dashboardResolver } from '../../resolvers/dashboard.resolver';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    canActivate: [authGuard],
    resolve: { dashboardData: dashboardResolver }
  },
  {
    path: 'items',
    component: ItemManagerComponent,
    canActivate: [authGuard],
    resolve: { dashboardData: dashboardResolver }
  }
];
