import { Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { TeamsComponent } from './modules/teams/teams.component';
import { UsersComponent } from './modules/users/users.component';
import { ProductsComponent } from './modules/products/products.component';
import { ProductModulesComponent } from './modules/product-modules/product-modules.component';
import { TasksComponent } from './modules/tasks/tasks.component';
import { BacklogComponent } from './modules/backlog/backlog.component';
import { SprintsComponent } from './modules/sprints/sprints.component';
import { SprintDetailsOrgComponent } from './modules/sprints/sprint-details-org.component';


export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product-modules', component: ProductModulesComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'backlog', component: BacklogComponent },
  { path: 'sprints', component: SprintsComponent },
  { path: 'sprints/:id', component: SprintDetailsOrgComponent },
  // ...other routes
];
