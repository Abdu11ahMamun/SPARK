import { Routes, CanActivateFn } from '@angular/router';
import { authGuard } from './modules/auth/auth.guard';
import { LoginComponent } from './modules/auth/login.component';
import { AuthService } from './modules/auth/auth.service';
import { inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { TeamsComponent } from './modules/teams/teams.component';
import { UsersComponent } from './modules/users/users.component';
import { ProductsComponent } from './modules/products/products.component';
import { ProductModulesComponent } from './modules/product-modules/product-modules.component';
import { MyTasksComponent } from './modules/tasks/my-tasks.component';
import { TeamSprintTasksComponent } from './modules/tasks/team-sprint-tasks.component';
import { BacklogComponent } from './modules/backlog/backlog.component';
import { SprintsComponent } from './modules/sprints/sprints.component';
import { SprintDetailsComponent } from './modules/sprints/sprint-details.component';
import { RolesComponent } from './modules/admin/roles/roles.component';
import { TaskTypesComponent } from './modules/admin/task-types/task-types.component';
import { PermissionManagementComponent } from './modules/admin/permissions/permission-management.component';
import { permissionGuard } from './core/guards/permission.guard';
import { Component } from '@angular/core';

// Simple unauthorized component (standalone inline) - can be moved later
@Component({
  standalone: true,
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center h-full py-20 text-center">
      <h1 class="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p class="text-gray-600 mb-6 max-w-lg">You don't have permission to view this page. If you believe this is an error, please contact your administrator.</p>
      <a routerLink="/dashboard" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">Return to Dashboard</a>
    </div>
  `
})
export class UnauthorizedComponent {}
// Removed broken imports - these components don't exist yet


// Prevent authenticated users from revisiting /login
const loginRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = auth.isAuthenticated();
  console.debug('[loginRedirectGuard] authenticated=', authenticated);
  if (authenticated) {
    const target = auth.firstAccessiblePath();
    console.debug('[loginRedirectGuard] redirecting to first accessible path:', target);
    return router.parseUrl(target);
  }
  return true;
};

// Smart redirect to first accessible route for root
const rootRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }
  const target = auth.firstAccessiblePath();
  console.debug('[rootRedirectGuard] redirecting to:', target);
  return router.parseUrl(target);
};

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Basic authenticated routes (using existing authGuard temporarily)
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['DASHBOARD_VIEW'] } },
  { path: 'my-tasks', component: MyTasksComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['TASK_VIEW'] } },
  { path: 'team-sprint-tasks', component: TeamSprintTasksComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['TASK_VIEW', 'TEAM_VIEW', 'SPRINT_VIEW'], requireAll: false } },
  { path: 'teams', component: TeamsComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['TEAM_VIEW'] } },
  { path: 'users', component: UsersComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['USER_VIEW'] } },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['PROJECT_VIEW','PRODUCT_VIEW','MODULE_VIEW'], requireAll: false } },
  { path: 'product-modules', component: ProductModulesComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['MODULE_VIEW'] } },
  { path: 'backlog', component: BacklogComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['BACKLOG_VIEW','TASK_VIEW'], requireAll: false } },
  { path: 'sprints', component: SprintsComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['SPRINT_VIEW','TASK_VIEW'], requireAll: false } },
  { path: 'sprints/:id', component: SprintDetailsComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['SPRINT_VIEW','TASK_VIEW'], requireAll: false } },
  { path: 'roles', component: RolesComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['ROLE_VIEW'] } },
  { path: 'permissions', component: PermissionManagementComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['SYSTEM_ADMIN','ROLE_VIEW'], requireAll: false }, runGuardsAndResolvers: 'always' },
  { path: 'task-types', component: TaskTypesComponent, canActivate: [authGuard, permissionGuard], data: { requiredPermissions: ['TASK_VIEW'] } },
  // Temporarily removed broken routes

  { path: '**', canActivate: [rootRedirectGuard], children: [] }
];
