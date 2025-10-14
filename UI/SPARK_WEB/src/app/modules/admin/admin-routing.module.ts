import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        data: { 
          title: 'Admin Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'permissions',
        component: PermissionManagementComponent,
        data: { 
          title: 'Permission Management',
          breadcrumb: 'Permissions'
        }
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
        data: { 
          title: 'Role Management',
          breadcrumb: 'Roles'
        }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        data: { 
          title: 'User Management',
          breadcrumb: 'Users'
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