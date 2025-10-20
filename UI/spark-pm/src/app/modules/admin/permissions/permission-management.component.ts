import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { Permission, Role } from '../../../core/models/permission.model';

interface PermissionMatrixCell {
  roleId: number;
  permissionId: number;
  assigned: boolean;
  role: Role;
  permission: Permission;
  changed?: boolean;
}

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="permission-management">
      <div class="page-header">
        <h1>Permission Management</h1>
        <p class="subtitle">Manage role permissions through an interactive matrix</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{stats.totalPermissions}}</div>
            <div class="stat-label">Total Permissions</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{stats.totalRoles}}</div>
            <div class="stat-label">Total Roles</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-link"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{stats.totalAssignments}}</div>
            <div class="stat-label">Assignments</div>
          </div>
        </div>
        
        <div class="stat-card" [class.warning]="pendingChanges.length > 0">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{pendingChanges.length}}</div>
            <div class="stat-label">Pending Changes</div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-bar">
        <div class="search-controls">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search permissions and roles..."
              [formControl]="searchControl"
              class="search-input">
          </div>
          
          <select class="filter-select" [value]="selectedResource" (change)="onResourceFilterChange($event)">
            <option value="">All Resources</option>
            <option *ngFor="let resource of resourceFilters" [value]="resource">{{resource}}</option>
          </select>
        </div>

        <div class="action-buttons">
          <button 
            class="btn btn-primary" 
            [disabled]="pendingChanges.length === 0 || loading"
            (click)="saveMatrixChanges()">
            <i class="fas fa-save"></i>
            Save Changes ({{pendingChanges.length}})
          </button>
          
          <button 
            class="btn btn-secondary" 
            [disabled]="pendingChanges.length === 0"
            (click)="resetMatrixChanges()">
            <i class="fas fa-undo"></i>
            Reset
          </button>
        </div>
      </div>

      <!-- Permission Matrix -->
      <div class="matrix-container" [class.loading]="loading">
        <div *ngIf="loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Loading permission matrix...</p>
        </div>

        <div class="matrix-wrapper" *ngIf="!loading && permissions.length > 0 && roles.length > 0">
          <table class="permission-matrix">
            <thead>
              <tr>
                <th class="sticky-header resource-header">Resource / Permission</th>
                <th *ngFor="let role of roles" class="role-header sticky-header">
                  <div class="role-info">
                    <div class="role-name">{{role.name}}</div>
                    <div class="role-description" *ngIf="role.description">{{role.description}}</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let permission of filteredPermissions; trackBy: trackPermission" 
                  class="permission-row">
                <td class="permission-info sticky-cell">
                  <div class="permission-details">
                    <div class="permission-name">
                      <span class="badge badge-resource">{{permission.resource}}</span>
                      {{permission.name}}
                    </div>
                    <div class="permission-action">{{permission.action}}</div>
                    <div class="permission-description" *ngIf="permission.description">
                      {{permission.description}}
                    </div>
                  </div>
                </td>
                <td *ngFor="let role of roles; trackBy: trackRole" 
                    class="matrix-cell">
                  <div class="permission-toggle">
                    <input
                      type="checkbox"
                      [id]="'matrix-' + role.id + '-' + permission.id"
                      [checked]="isPermissionAssigned(role, permission)"
                      [class.changed]="isPermissionChanged(role, permission)"
                      (change)="togglePermissionAssignment(role.id, permission.id)"
                      class="toggle-checkbox">
                    <label 
                      [for]="'matrix-' + role.id + '-' + permission.id"
                      class="toggle-label">
                      <span class="sr-only">
                        {{isPermissionAssigned(role, permission) ? 'Revoke' : 'Grant'}} 
                        {{permission.name}} for {{role.name}}
                      </span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error Loading Data</h3>
          <p>{{error}}</p>
          <button class="btn btn-primary" (click)="loadInitialData()">
            <i class="fas fa-refresh"></i> Retry
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && (permissions.length === 0 || roles.length === 0)" 
             class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-table"></i>
          </div>
          <h3>No Data Available</h3>
          <p *ngIf="permissions.length === 0">No permissions found. Create some permissions to get started.</p>
          <p *ngIf="roles.length === 0">No roles found. Create some roles to get started.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .permission-management {
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6c757d;
      font-size: 1.1rem;
    }

    /* Statistics */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-card.warning {
      border-left: 4px solid #f39c12;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3498db, #2ecc71);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-label {
      color: #6c757d;
      font-weight: 500;
    }

    /* Controls */
    .controls-bar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .search-controls {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3498db, #2ecc71);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    /* Matrix */
    .matrix-container {
      position: relative;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e3e3e3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .matrix-wrapper {
      overflow: auto;
      max-height: 70vh;
    }

    .permission-matrix {
      width: 100%;
      border-collapse: collapse;
    }

    .sticky-header {
      position: sticky;
      top: 0;
      background: #f8f9fa;
      z-index: 5;
      border-bottom: 2px solid #dee2e6;
    }

    .resource-header {
      left: 0;
      z-index: 6;
      min-width: 300px;
      padding: 1rem;
    }

    .role-header {
      padding: 1rem 0.75rem;
      text-align: center;
      min-width: 120px;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .role-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .role-description {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .permission-row:nth-child(even) {
      background: #f8f9fa;
    }

    .permission-info {
      position: sticky;
      left: 0;
      background: inherit;
      z-index: 4;
      padding: 1rem;
      border-right: 2px solid #dee2e6;
    }

    .permission-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .permission-name {
      font-weight: 600;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-resource {
      background: #3498db;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .permission-action {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .permission-description {
      color: #6c757d;
      font-size: 0.75rem;
      line-height: 1.4;
    }

    .matrix-cell {
      padding: 0.75rem;
      text-align: center;
      border-right: 1px solid #dee2e6;
    }

    .permission-toggle {
      display: flex;
      justify-content: center;
    }

    .toggle-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #3498db;
    }

    .toggle-checkbox.changed {
      outline: 2px solid #f39c12;
      outline-offset: 2px;
    }

    .toggle-label {
      cursor: pointer;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Empty State */
    .empty-state, .error-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #6c757d;
    }

    .empty-icon, .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }

    .empty-state h3, .error-state h3 {
      margin-bottom: 1rem;
      color: #495057;
    }
    
    .error-state {
      color: #dc3545;
    }
    
    .error-icon {
      color: #dc3545;
    }
    
    .error-state h3 {
      color: #dc3545;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .permission-management {
        padding: 1rem;
      }

      .controls-bar {
        flex-direction: column;
        gap: 1rem;
      }

      .search-controls {
        flex-direction: column;
      }

      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PermissionManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data
  permissions: Permission[] = [];
  roles: Role[] = [];
  filteredPermissions: Permission[] = [];
  
  // UI State
  loading = false;
  error: string | null = null;
  searchControl = new FormControl('');
  selectedResource = '';
  resourceFilters: string[] = [];
  
  // Statistics
  stats = {
    totalPermissions: 0,
    totalRoles: 0,
    totalAssignments: 0,
    resourceGroups: 0
  };
  
  // Matrix state
  matrixChanges = new Map<string, boolean>();
  pendingChanges: { roleId: number; permissionId: number; assigned: boolean }[] = [];
  
  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🎯 PermissionManagementComponent ngOnInit called');
    this.setupSubscriptions();
    this.loadInitialData();
    
    // Listen to route changes to refresh data when navigating to this component
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes('/permissions')) {
        console.log('🎯 Route activated for permissions, ensuring data is loaded');
        // Small delay to ensure component is fully initialized
        setTimeout(() => {
          this.loadInitialData();
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to search changes
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterData();
      });
      
    console.log('🔥 Subscriptions setup complete');
  }

  loadInitialData(): void {
    // Prevent multiple simultaneous loads
    if (this.loading) {
      console.log('⏳ Data loading already in progress, skipping duplicate request');
      return;
    }

    console.log('🚀 Loading permission management data from APIs...');
    this.loading = true;
    this.error = null;
    
    // Use real APIs only - no fallbacks, no mock data
    combineLatest([
      this.permissionService.getAllPermissions(),
      this.permissionService.getAllRoles()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([permissions, roles]) => {
        console.log('✅ API Response - Permissions:', permissions.length, 'Roles:', roles.length);
        
        this.permissions = permissions || [];
        this.roles = roles || [];
        
        this.updateResourceFilters();
        this.updateStats();
        this.filterData();
        this.loading = false;
        
        console.log('🎉 Data loaded successfully and UI updated');
        
        if (this.permissions.length === 0) {
          console.warn('⚠️ No permissions received from API');
        }
        if (this.roles.length === 0) {
          console.warn('⚠️ No roles received from API');
        }
      },
      error: (error) => {
        console.error('❌ API Error loading permission data:', error);
        this.loading = false;
        this.error = `Failed to load data: ${error.message || 'Unknown error'}`;
      }
    });
  }

  private checkDataLoadComplete(): void {
    // Only set loading to false when we have both permissions and roles
    if (this.permissions.length > 0 && this.roles.length > 0) {
      console.log('Data load complete, hiding loading state');
      this.loading = false;
    }
  }

  private filterData(): void {
    let filtered = [...this.permissions];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.resource.toLowerCase().includes(searchTerm) ||
        p.action.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply resource filter
    if (this.selectedResource) {
      filtered = filtered.filter(p => p.resource === this.selectedResource);
    }

    this.filteredPermissions = filtered;
  }

  private updateResourceFilters(): void {
    this.resourceFilters = [...new Set(this.permissions.map(p => p.resource))].sort();
  }

  private updateStats(): void {
    const totalAssignments = this.roles.reduce((total, role) => {
      return total + (role.permissions?.length || 0);
    }, 0);

    this.stats = {
      totalPermissions: this.permissions.length,
      totalRoles: this.roles.length,
      totalAssignments: totalAssignments,
      resourceGroups: this.resourceFilters.length
    };
  }

  // Permission Matrix Methods
  isPermissionAssigned(role: Role, permission: Permission): boolean {
    const changeKey = `${role.id}-${permission.id}`;
    
    if (this.matrixChanges.has(changeKey)) {
      return this.matrixChanges.get(changeKey)!;
    }
    
    // For now, since we don't have role-permission relationship API,
    // return false - this can be enhanced when the API is available
    return false;
  }

  isPermissionChanged(role: Role, permission: Permission): boolean {
    const changeKey = `${role.id}-${permission.id}`;
    return this.matrixChanges.has(changeKey);
  }

  togglePermissionAssignment(roleId: number, permissionId: number): void {
    const changeKey = `${roleId}-${permissionId}`;
    const role = this.roles.find(r => r.id === roleId);
    const permission = this.permissions.find(p => p.id === permissionId);
    
    if (!role || !permission) return;

    const currentlyAssigned = role.permissions?.some(p => p.id === permissionId) || false;
    const newAssignment = this.matrixChanges.has(changeKey) ? 
      !this.matrixChanges.get(changeKey)! : !currentlyAssigned;
    
    this.matrixChanges.set(changeKey, newAssignment);
    
    // Update pending changes
    const existingChangeIndex = this.pendingChanges.findIndex(
      c => c.roleId === roleId && c.permissionId === permissionId
    );
    
    if (existingChangeIndex >= 0) {
      this.pendingChanges[existingChangeIndex].assigned = newAssignment;
    } else {
      this.pendingChanges.push({ roleId, permissionId, assigned: newAssignment });
    }
  }

  async saveMatrixChanges(): Promise<void> {
    if (this.pendingChanges.length === 0) return;

    this.loading = true;

    try {
      // Group changes by role and operation type
      const assignOperations = new Map<number, number[]>();
      const revokeOperations = new Map<number, number[]>();

      this.pendingChanges.forEach(change => {
        const targetMap = change.assigned ? assignOperations : revokeOperations;
        
        if (!targetMap.has(change.roleId)) {
          targetMap.set(change.roleId, []);
        }
        targetMap.get(change.roleId)!.push(change.permissionId);
      });

      // Execute bulk assign operations
      for (const [roleId, permissionIds] of assignOperations.entries()) {
        await this.permissionService.bulkAssignPermissions({
          roleId,
          permissionIds
        }).toPromise();
      }

      // Execute bulk revoke operations
      for (const [roleId, permissionIds] of revokeOperations.entries()) {
        await this.permissionService.bulkRevokePermissions({
          roleId,
          permissionIds
        }).toPromise();
      }

      // Clear pending changes
      this.resetMatrixChanges();
      
      // Refresh data
      this.loadInitialData();
      
      console.log('Matrix changes saved successfully');
    } catch (error) {
      console.error('Failed to save matrix changes:', error);
    } finally {
      this.loading = false;
    }
  }

  resetMatrixChanges(): void {
    this.matrixChanges.clear();
    this.pendingChanges = [];
  }

  onResourceFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedResource = target.value;
    this.filterData();
  }

  // Tracking functions for performance
  trackPermission(index: number, permission: Permission): number {
    return permission.id;
  }

  trackRole(index: number, role: Role): number {
    return role.id;
  }
}