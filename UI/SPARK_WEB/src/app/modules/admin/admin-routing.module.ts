import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { UserManagementComponent } from './user-management/user-management.component';

// Import guards
import { AuthGuard, AdminGuard, PermissionGuard, ResourceGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [ResourceGuard],
        data: { 
          title: 'Admin Dashboard',
          breadcrumb: 'Dashboard',
          resource: 'Dashboard',
          action: 'view'
        }
      },
      {
        path: 'permissions',
        component: PermissionManagementComponent,
        canActivate: [ResourceGuard],
        data: { 
          title: 'Permission Management',
          breadcrumb: 'Permissions',
          resource: 'Roles',
          action: 'manage'
        }
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
        canActivate: [ResourceGuard],
        data: { 
          title: 'Role Management',
          breadcrumb: 'Roles',
          resource: 'Roles',
          action: 'view'
        }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [ResourceGuard],
        data: { 
          title: 'User Management',
          breadcrumb: 'Users',
          resource: 'Users',
          action: 'view'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }