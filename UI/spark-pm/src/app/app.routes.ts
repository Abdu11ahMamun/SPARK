import { Routes, CanActivateFn } from '@angular/router';
import { authGuard } from './modules/auth/auth.guard';
import { LoginComponent } from './modules/auth/login.component';
import { AuthService } from './modules/auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { TeamsComponent } from './modules/teams/teams.component';
import { UsersComponent } from './modules/users/users.component';
import { ProductsComponent } from './modules/products/products.component';
import { ProductModulesComponent } from './modules/product-modules/product-modules.component';
import { MyTasksComponent } from './modules/tasks/my-tasks.component';
import { BacklogComponent } from './modules/backlog/backlog.component';
import { SprintsComponent } from './modules/sprints/sprints.component';
import { SprintDetailsComponent } from './modules/sprints/sprint-details.component';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { TaskTypesComponent } from './modules/admin/task-types/task-types.component';
import { PermissionManagementComponent } from './modules/admin/permissions/permission-management.component';
// Removed broken imports - these components don't exist yet


// Prevent authenticated users from revisiting /login
const loginRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = auth.isAuthenticated();
  console.debug('[loginRedirectGuard] authenticated=', authenticated);
  if (authenticated) {
    console.debug('[loginRedirectGuard] redirecting to /');
    return router.parseUrl('/');
  }
  return true;
};

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },

  // Basic authenticated routes (using existing authGuard temporarily)
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'my-tasks', component: MyTasksComponent, canActivate: [authGuard] },
  { path: 'teams', component: TeamsComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'product-modules', component: ProductModulesComponent, canActivate: [authGuard] },
  { path: 'backlog', component: BacklogComponent, canActivate: [authGuard] },
  { path: 'sprints', component: SprintsComponent, canActivate: [authGuard] },
  { path: 'sprints/:id', component: SprintDetailsComponent, canActivate: [authGuard] },
  { path: 'roles', component: RolesComponent, canActivate: [authGuard] },
  { path: 'permissions', component: PermissionManagementComponent, canActivate: [authGuard], runGuardsAndResolvers: 'always' },
  { path: 'task-types', component: TaskTypesComponent, canActivate: [authGuard] },
  // Temporarily removed broken routes

  { path: '**', redirectTo: '/dashboard' }
];
