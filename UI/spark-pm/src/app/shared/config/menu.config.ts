import { MenuItem } from '../models/menu-item.model';

// Central menu definition allowing RBAC filtering.
// Permission codes align with AuthService mock and expected backend codes.
export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/', iconKey: 'home', requiredPermissions: ['DASHBOARD_VIEW'] },

  { section: 'Management', label: 'Management', iconKey: 'home' },
  { label: 'Team Management', path: '/teams', iconKey: 'teamList', requiredPermissions: ['TEAM_VIEW'] },
  { label: 'User Management', path: '/users', iconKey: 'userInfo', requiredPermissions: ['USER_VIEW'] },
  { label: 'Products', path: '/products', iconKey: 'productList', requiredPermissions: ['PROJECT_VIEW','PRODUCT_VIEW','MODULE_VIEW'], requireAll: false },
  { label: 'Product Modules', path: '/product-modules', iconKey: 'productModule', requiredPermissions: ['MODULE_VIEW'] },
  { label: 'Roles', path: '/roles', iconKey: 'roles', requiredPermissions: ['ROLE_VIEW'] },
  { label: 'Permission Management', path: '/permissions', iconKey: 'permissions', requiredPermissions: ['ROLE_VIEW','USER_VIEW','SYSTEM_ADMIN'] },
  { label: 'Task Types', path: '/task-types', iconKey: 'taskTypes', requiredPermissions: ['TASK_VIEW'] },

  { section: 'Task & Backlog', label: 'Task & Backlog', iconKey: 'tasks' },
  { label: 'My Tasks', path: '/my-tasks', iconKey: 'myTasks', requiredPermissions: ['TASK_VIEW'] },
  { label: 'Team Sprint Tasks', path: '/team-sprint-tasks', iconKey: 'teamTasks', requiredPermissions: ['TASK_VIEW', 'TEAM_VIEW', 'SPRINT_VIEW'], requireAll: false },
  { label: 'Backlog Management', path: '/backlog', iconKey: 'backlog', requiredPermissions: ['BACKLOG_VIEW','TASK_VIEW'], requireAll: false },

  { section: 'Sprint Management', label: 'Sprint Management', iconKey: 'sprints' },
  { label: 'Sprint Management', path: '/sprints', iconKey: 'sprints', requiredPermissions: ['SPRINT_VIEW','TASK_VIEW'], requireAll: false },

  { section: 'Reports', label: 'Reports', iconKey: 'summaryReport' },
  { label: 'Comparative Statement', iconKey: 'comparativeStatement', disabled: true, devNote: 'Under Development', requiredPermissions: ['REPORT_VIEW'] },
  { label: 'Summary Report', iconKey: 'summaryReport', disabled: true, devNote: 'Under Development', requiredPermissions: ['REPORT_VIEW'] },
  { label: 'User Comparative', iconKey: 'userComparative', disabled: true, devNote: 'Under Development', requiredPermissions: ['REPORT_VIEW'] },
  { label: 'Backlog Task Assigned', iconKey: 'backlogTaskAssigned', disabled: true, devNote: 'Under Development', requiredPermissions: ['REPORT_VIEW'] },
];
