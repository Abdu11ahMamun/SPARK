import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { PermissionService } from '../../../core/services/permission.service';
import { 
  Permission, 
  Role, 
  GroupedPermissionsDto,
  PermissionRequest,
  RolePermissionRequest,
  BulkRolePermissionRequest 
} from '../../../core/models/permission.model';
import { HasPermissionDirective, HasRoleDirective } from '../../../core/directives/permission.directive';

interface PermissionMatrixCell {
  roleId: number;
  permissionId: number;
  assigned: boolean;
  role: Role;
  permission: Permission;
  changed?: boolean;
}

interface PermissionGroup {
  category: string;
  permissions: Permission[];
  expanded: boolean;
}

@Component({
  selector: 'app-permission-management',
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.css']
})
export class PermissionManagementComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  private destroy$ = new Subject<void>();
  
  // Data
  permissions: Permission[] = [];
  roles: Role[] = [];
  groupedPermissions: PermissionGroup[] = [];
  permissionMatrix: PermissionMatrixCell[][] = [];
  
  // UI State
  loading = false;
  searchControl = new FormControl('');
  selectedView$ = new BehaviorSubject<'matrix' | 'list' | 'groups'>('matrix');
  
  // Filters
  categoryFilter = new FormControl('all');
  resourceFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Available filter options
  categories: string[] = [];
  resources: string[] = [];
  
  // Matrix state
  matrixChanges: Map<string, PermissionMatrixCell> = new Map();
  hasUnsavedChanges = false;
  
  // Statistics
  statistics = {
    totalPermissions: 0,
    activePermissions: 0,
    totalRoles: 0,
    assignedPermissions: 0
  };

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.initializeData();
    this.setupSearch();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    this.loading = true;
    
    combineLatest([
      this.permissionService.getAllPermissions(),
      this.permissionService.getAllRoles(),
      this.permissionService.getPermissionStatistics()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([permissions, roles, stats]) => {
        this.permissions = permissions;
        this.roles = roles;
        this.statistics = {
          totalPermissions: permissions.length,
          activePermissions: permissions.filter(p => p.active).length,
          totalRoles: roles.length,
          assignedPermissions: stats.assignedPermissions || 0
        };
        
        this.setupFilterOptions();
        this.createPermissionGroups();
        this.buildPermissionMatrix();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterPermissions(searchTerm);
    });
  }

  private setupFilters(): void {
    combineLatest([
      this.categoryFilter.valueChanges.pipe(startWith('all')),
      this.resourceFilter.valueChanges.pipe(startWith('all')),
      this.statusFilter.valueChanges.pipe(startWith('all'))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private setupFilterOptions(): void {
    this.categories = [...new Set(this.permissions.map(p => p.category).filter(c => c))].sort();
    this.resources = [...new Set(this.permissions.map(p => p.resource))].sort();
  }

  private createPermissionGroups(): void {
    const grouped = this.permissions.reduce((acc, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    this.groupedPermissions = Object.keys(grouped).sort().map(category => ({
      category,
      permissions: grouped[category].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      expanded: true
    }));
  }

  private buildPermissionMatrix(): void {
    this.permissionMatrix = [];
    
    this.roles.forEach((role, roleIndex) => {
      this.permissionService.getRolePermissions(role.id!).pipe(
        takeUntil(this.destroy$)
      ).subscribe(rolePermissions => {
        const assignedPermissionIds = rolePermissions.map(rp => rp.permission.id);
        
        this.permissionMatrix[roleIndex] = this.permissions.map(permission => ({
          roleId: role.id!,
          permissionId: permission.id!,
          assigned: assignedPermissionIds.includes(permission.id!),
          role: role,
          permission: permission
        }));
      });
    });
  }

  // Permission Matrix Operations
  togglePermissionAssignment(cell: PermissionMatrixCell): void {
    const key = `${cell.roleId}-${cell.permissionId}`;
    cell.assigned = !cell.assigned;
    cell.changed = true;
    
    this.matrixChanges.set(key, { ...cell });
    this.hasUnsavedChanges = true;
  }

  toggleRolePermissions(role: Role): void {
    const roleRow = this.permissionMatrix.find(row => row[0]?.roleId === role.id);
    if (!roleRow) return;

    const allAssigned = roleRow.every(cell => cell.assigned);
    
    roleRow.forEach(cell => {
      if (cell.assigned !== !allAssigned) {
        this.togglePermissionAssignment(cell);
      }
    });
  }

  togglePermissionForAllRoles(permission: Permission): void {
    this.permissionMatrix.forEach(row => {
      const cell = row.find(c => c.permissionId === permission.id);
      if (cell) {
        const anyAssigned = this.permissionMatrix.some(r => 
          r.find(c => c.permissionId === permission.id)?.assigned
        );
        
        if (cell.assigned !== !anyAssigned) {
          this.togglePermissionAssignment(cell);
        }
      }
    });
  }

  // Save Changes
  saveMatrixChanges(): void {
    if (!this.hasUnsavedChanges) return;

    this.loading = true;
    const changes = Array.from(this.matrixChanges.values());
    
    const assignRequests: RolePermissionRequest[] = [];
    const revokeRequests: RolePermissionRequest[] = [];
    
    changes.forEach(change => {
      const request: RolePermissionRequest = {
        roleId: change.roleId,
        permissionId: change.permissionId,
        grantedBy: 'admin', // Should come from current user context
        notes: 'Matrix bulk update'
      };

      if (change.assigned) {
        assignRequests.push(request);
      } else {
        revokeRequests.push(request);
      }
    });

    // Process assignments and revocations
    const operations = [];
    
    if (assignRequests.length > 0) {
      operations.push(
        this.permissionService.bulkAssignPermissions({
          assignments: assignRequests,
          grantedBy: 'admin'
        })
      );
    }
    
    if (revokeRequests.length > 0) {
      operations.push(
        this.permissionService.bulkRevokePermissions({
          revocations: revokeRequests,
          grantedBy: 'admin'
        })
      );
    }

    combineLatest(operations).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.matrixChanges.clear();
        this.hasUnsavedChanges = false;
        this.loading = false;
        // Show success message
      },
      error: (error) => {
        console.error('Error saving changes:', error);
        this.loading = false;
        // Show error message
      }
    });
  }

  discardChanges(): void {
    this.matrixChanges.clear();
    this.hasUnsavedChanges = false;
    this.buildPermissionMatrix();
  }

  // View Management
  setView(view: 'matrix' | 'list' | 'groups'): void {
    this.selectedView$.next(view);
  }

  get selectedView(): string {
    return this.selectedView$.value;
  }

  toggleGroup(group: PermissionGroup): void {
    group.expanded = !group.expanded;
  }

  // New methods for consistent UI
  refreshData(): void {
    this.initializeData();
  }

  addRole(): void {
    // TODO: Implement add role functionality
    console.log('Add role functionality to be implemented');
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.searchTerm = '';
  }

  get searchTerm(): string {
    return this.searchControl.value || '';
  }

  set searchTerm(value: string) {
    this.searchControl.setValue(value);
  }

  // Filtering
  private filterPermissions(searchTerm: string | null): void {
    if (!searchTerm) {
      this.applyFilters();
      return;
    }

    this.permissionService.searchPermissions(searchTerm).pipe(
      takeUntil(this.destroy$)
    ).subscribe((filtered: Permission[]) => {
      // Apply search results with current filters
      this.applyFiltersToPermissions(filtered);
    });
  }

  private applyFilters(): void {
    this.applyFiltersToPermissions(this.permissions);
  }

  private applyFiltersToPermissions(basePermissions: Permission[]): void {
    let filtered = [...basePermissions];

    // Category filter
    if (this.categoryFilter.value !== 'all') {
      filtered = filtered.filter(p => p.category === this.categoryFilter.value);
    }

    // Resource filter
    if (this.resourceFilter.value !== 'all') {
      filtered = filtered.filter(p => p.resource === this.resourceFilter.value);
    }

    // Status filter
    if (this.statusFilter.value !== 'all') {
      const isActive = this.statusFilter.value === 'active';
      filtered = filtered.filter(p => p.active === isActive);
    }

    // Update grouped permissions and matrix based on filtered results
    this.createGroupedPermissionsFromFiltered(filtered);
    this.filterMatrixByPermissions(filtered);
  }

  private createGroupedPermissionsFromFiltered(filtered: Permission[]): void {
    const grouped = filtered.reduce((acc, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    this.groupedPermissions = Object.keys(grouped).sort().map(category => ({
      category,
      permissions: grouped[category].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      expanded: true
    }));
  }

  private filterMatrixByPermissions(filtered: Permission[]): void {
    const filteredIds = new Set(filtered.map(p => p.id));
    // You could filter the matrix columns here if needed
    // For now, we'll keep the full matrix but could highlight filtered permissions
  }

  // Utility Methods
  getPermissionCount(role: Role): number {
    const roleRow = this.permissionMatrix.find(row => row[0]?.roleId === role.id);
    return roleRow ? roleRow.filter(cell => cell.assigned).length : 0;
  }

  getRoleCount(permission: Permission): number {
    return this.permissionMatrix.filter(row => 
      row.find(cell => cell.permissionId === permission.id)?.assigned
    ).length;
  }

  isPermissionChanged(roleId: number, permissionId: number): boolean {
    return this.matrixChanges.has(`${roleId}-${permissionId}`);
  }

  // Bulk Operations
  assignAllPermissionsToRole(role: Role): void {
    const roleRow = this.permissionMatrix.find(row => row[0]?.roleId === role.id);
    if (!roleRow) return;

    roleRow.forEach(cell => {
      if (!cell.assigned) {
        this.togglePermissionAssignment(cell);
      }
    });
  }

  revokeAllPermissionsFromRole(role: Role): void {
    const roleRow = this.permissionMatrix.find(row => row[0]?.roleId === role.id);
    if (!roleRow) return;

    roleRow.forEach(cell => {
      if (cell.assigned) {
        this.togglePermissionAssignment(cell);
      }
    });
  }

  // Export/Import (for future implementation)
  exportPermissionMatrix(): void {
    // Implementation for exporting current permission matrix
    console.log('Export functionality to be implemented');
  }

  importPermissionMatrix(): void {
    // Implementation for importing permission matrix
    console.log('Import functionality to be implemented');
  }

  // Utility methods for template
  trackByRoleId(index: number, role: Role): number {
    return role.id!;
  }

  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id!;
  }

  getCellValue(roleIndex: number, permissionIndex: number): PermissionMatrixCell | null {
    if (!this.permissionMatrix[roleIndex] || !this.permissionMatrix[roleIndex][permissionIndex]) {
      return null;
    }
    return this.permissionMatrix[roleIndex][permissionIndex];
  }

  hasPermissionChanges(permission: Permission): boolean {
    return Array.from(this.matrixChanges.values())
      .some(change => change.permissionId === permission.id && change.changed);
  }

  hasRoleChanges(role: Role): boolean {
    return Array.from(this.matrixChanges.values())
      .some(change => change.roleId === role.id && change.changed);
  }

  getAssignedRoles(permission: Permission): Role[] {
    return this.roles.filter(role => {
      const roleRow = this.permissionMatrix.find(row => row[0]?.roleId === role.id);
      return roleRow?.find(cell => cell.permissionId === permission.id)?.assigned;
    });
  }

  // Seed default permissions
  seedDefaultPermissions(): void {
    this.loading = true;
    this.permissionService.seedDefaultPermissions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.initializeData();
      },
      error: (error: any) => {
        console.error('Error seeding permissions:', error);
        this.loading = false;
      }
    });
  }
}