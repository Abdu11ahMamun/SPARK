import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { PermissionManagementComponent } from './permission-management/permission-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PermissionService } from './services/permission.service';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    PermissionManagementComponent,
    RoleManagementComponent,
    UserManagementComponent,
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    AdminRoutingModule
  ],
  providers: [
    PermissionService
  ]
})
export class AdminModule { }