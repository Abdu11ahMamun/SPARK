import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { SprintService, SprintUserCapacity, SprintCapacitySummary, SprintCreation } from './sprint.service';
import { TeamService } from '../teams/team.service';
import { Team, TeamMember } from '../teams/team.model';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';

export interface SprintCapacityDialogData {
  mode: 'create' | 'edit';
  sprint?: any;
  teamId?: number;
}

/**
 * Sprint Capacity Planning Dialog Component
 * 
 * Professional-grade capacity management interface for agile sprint planning.
 * Features include:
 * - Sprint creation with date selection and team assignment
 * - Dynamic user capacity allocation table
 * - Real-time capacity calculations and over-allocation warnings
 * - Leave days management and working hours tracking
 * - Industry-standard UI/UX matching JIRA/ClickUp standards
 * 
 * @author SPARK Development Team
 */
@Component({
  selector: 'app-sprint-capacity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './sprint-capacity-dialog.component.html',
  styleUrls: ['./sprint-capacity-dialog.component.scss']
})
export class SprintCapacityDialogComponent implements OnInit {
  
  @Input() isVisible = false;
  @Input() data: SprintCapacityDialogData = { mode: 'create' };
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveComplete = new EventEmitter<any>();
  
  protected Math = Math; // Expose Math to template
  
  sprintForm!: FormGroup;
  availableUsers: TeamMember[] = [];
  allUsers: User[] = []; // All users from the system
  teams: Team[] = []; // Changed from any[] to Team[]
  isLoading = false;
  isTeamsLoading = false; // Separate loading state for teams
  capacitySummary: SprintCapacitySummary | null = null;
  errorMessage = '';
  successMessage = '';
  selectedTeamId: number | null = null; // Track selected team
  showAllUsers = false; // Toggle between team members and all users
  
  // Table configuration
  displayedColumns: string[] = [
    'userName', 
    'userCapacity', 
    'leaveDays', 
    'totalWorkingHours', 
    'userWorkingHours',
    'availableHours',
    'utilizationPercentage',
    'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private sprintService: SprintService,
    private teamService: TeamService,
  private userService: UserService,
  private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadTeams(); // Load teams first
    this.loadAllUsers(); // Load all users for external selection
    this.loadInitialData();
    if (this.data.mode === 'edit' && this.data.sprint) {
      this.loadSprintData();
    }
  }

  private initializeForm(): void {
    this.sprintForm = this.fb.group({
      sprintName: ['', [Validators.required, Validators.maxLength(100)]],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      tramId: [this.data.teamId || null, Validators.required],
      sprintPoint: [0, [Validators.min(0)]],
      detailsRemark: ['', Validators.maxLength(1000)],
      createBy: ['SYSTEM'], // TODO: Get from auth service
      noOfHolidays: [0, [Validators.min(0)]],
      defaultDailyHours: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
      userCapacities: this.fb.array([])
    });

    // Add date validation
    this.sprintForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.validateDates();
      this.recalculateAllCapacities();
    });
    this.sprintForm.get('toDate')?.valueChanges.subscribe(() => {
      this.validateDates();
      this.recalculateAllCapacities();
    });
    
    // Add capacity-affecting parameter subscribers
    this.sprintForm.get('noOfHolidays')?.valueChanges.subscribe(() => {
      this.recalculateAllCapacities();
    });
    this.sprintForm.get('defaultDailyHours')?.valueChanges.subscribe(() => {
      this.recalculateAllCapacities();
    });
  }

  private validateDates(): void {
    const fromDate = this.sprintForm.get('fromDate')?.value;
    const toDate = this.sprintForm.get('toDate')?.value;
    
    if (fromDate && toDate && fromDate >= toDate) {
      this.sprintForm.get('toDate')?.setErrors({ invalidDateRange: true });
    } else {
      const toDateControl = this.sprintForm.get('toDate');
      if (toDateControl?.errors?.['invalidDateRange']) {
        delete toDateControl.errors['invalidDateRange'];
        if (Object.keys(toDateControl.errors).length === 0) {
          toDateControl.setErrors(null);
        }
      }
    }
    
    // Recalculate capacity when dates change
    this.calculateCapacitySummary();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // For now, we'll load team members based on teamId if provided
    if (this.data.teamId) {
      this.loadTeamUsers(this.data.teamId);
    } else {
      this.isLoading = false;
    }
  }

  private loadTeams(): void {
    this.isTeamsLoading = true;
    this.teamService.getTeams().subscribe({
      next: (teams: Team[]) => {
        this.teams = teams;
        this.isTeamsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading teams:', error);
        this.errorMessage = 'Error loading teams';
        this.isTeamsLoading = false;
      }
    });
  }

  private loadAllUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.allUsers = users;
      },
      error: (error: any) => {
        console.error('Error loading all users:', error);
        this.errorMessage = 'Error loading users';
      }
    });
  }

  private loadSprintData(): void {
    if (!this.data.sprint?.id) return;
    
    // Load sprint user capacities instead of full sprint data
    this.sprintService.getSprintUserCapacities(this.data.sprint.id).subscribe({
      next: (capacities: SprintUserCapacity[]) => {
        this.loadUserCapacities(capacities);
      },
      error: (error: any) => {
        console.error('Error loading sprint data:', error);
        this.errorMessage = 'Error loading sprint data';
      }
    });
  }

  private loadUserCapacities(capacities: SprintUserCapacity[]): void {
    const capacitiesFormArray = this.userCapacitiesFormArray;
    capacitiesFormArray.clear();
    
    capacities.forEach((capacity: SprintUserCapacity) => {
      capacitiesFormArray.push(this.createUserCapacityFormGroup(capacity));
    });
  }

  get userCapacitiesFormArray(): FormArray {
    return this.sprintForm.get('userCapacities') as FormArray;
  }

  private createUserCapacityFormGroup(capacity?: SprintUserCapacity): FormGroup {
    return this.fb.group({
      id: [capacity?.id || null],
      userId: [capacity?.userId || null, Validators.required],
      userName: [capacity?.userName || ''],
      userCapacityPercentage: [capacity?.userCapacityPercentage || 100, [Validators.required, Validators.min(1), Validators.max(100)]],
      leaveDays: [capacity?.leaveDays || 0, [Validators.min(0)]],
      dailyWorkingHours: [capacity?.dailyWorkingHours || 8, [Validators.min(0)]],
      allocatedHours: [capacity?.allocatedHours || 0, [Validators.min(0)]],
      availableWorkingHours: [{ value: capacity?.availableWorkingHours || 0, disabled: true }],
      utilizationPercentage: [{ value: capacity?.utilizationPercentage || 0, disabled: true }],
      isOverAllocated: [{ value: capacity?.isOverAllocated || false, disabled: true }]
    });
  }

  onTeamChange(teamId: number | string): void {
    // Coerce to number to avoid string/number mismatches from select change event
    const coercedTeamId = Number(teamId);
    this.selectedTeamId = isNaN(coercedTeamId) ? null : coercedTeamId;
    this.showAllUsers = false; // Reset to team members view

    // Set loading while fetching members and preparing the table
    this.isLoading = true;
  // Reset users to prevent stale display and force immediate UI refresh
  this.availableUsers = [];
  this.updateDisplayedUsers();
  this.cdr.detectChanges();

    // Clear existing user capacities when team changes
    this.userCapacitiesFormArray.clear();
    this.calculateCapacitySummary();

    if (this.selectedTeamId !== null) {
      this.loadTeamUsers(this.selectedTeamId);
    } else {
      this.isLoading = false;
    }
  }

  // Check if team management is enabled
  isTeamManagementEnabled(): boolean {
    return this.selectedTeamId !== null;
  }

  // Toggle between team members and all users
  toggleUserSource(): void {
    this.showAllUsers = !this.showAllUsers;
  this.updateDisplayedUsers();
  this.cdr.detectChanges();
  }

  // Get currently displayed users (either team members or all users)
  private displayedUsers: { id: number; firstName: string; lastName: string; email?: string; phone?: string }[] = [];
  getDisplayedUsers(): any[] { return this.displayedUsers; }

  private updateDisplayedUsers(): void {
    if (this.showAllUsers) {
      this.displayedUsers = (this.allUsers || [])
        .filter(user => user && user.id != null)
        .map(user => ({
          id: user.id as number,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
    } else {
      this.displayedUsers = (this.availableUsers || [])
        .filter(tm => tm && tm.userId != null)
        .map(tm => ({
          id: tm.userId as number,
          firstName: tm.userName || '',
          lastName: '',
          email: tm.userEmail || '',
          phone: ''
        }));
    }
  }

  private loadTeamUsers(teamId: number): void {
    this.sprintService.getTeamMembers(teamId).subscribe({
      next: (users: TeamMember[]) => {
  this.availableUsers = users || [];
        
        // Automatically add all team members to the capacity planning
        this.addAllTeamMembers();

  // Done loading after members are added
  this.isLoading = false;

  // Trigger one full recompute to ensure summary reflects new rows
  this.recalculateAllCapacities();
  this.updateDisplayedUsers();
  this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading team users:', error);
        this.errorMessage = 'Error loading team users';
        this.isLoading = false;
        this.updateDisplayedUsers();
        this.cdr.detectChanges();
      }
    });
  }

  private addAllTeamMembers(): void {
    // Add all team members to the capacity form automatically
    if (!this.availableUsers || this.availableUsers.length === 0) {
      return;
    }
    this.availableUsers.forEach((user, index) => {
      const userCapacity = this.createUserCapacityFormGroup();
      userCapacity.patchValue({
        userId: user.userId,
        userName: user.userName,
        userCapacityPercentage: 100, // Default 100% capacity
        leaveDays: 0, // Default no leave days
        dailyWorkingHours: 8 // Default 8 hours per day
      });
      
      this.userCapacitiesFormArray.push(userCapacity);
      
      // Subscribe to changes for real-time calculations
      this.subscribeToCapacityChanges(userCapacity);
      
      // Calculate capacity for this user (skip summary calculation for performance)
      const arrayIndex = this.userCapacitiesFormArray.length - 1;
      this.calculateUserCapacity(arrayIndex, true);
    });
    
    // Calculate summary once after adding all users
    this.calculateCapacitySummary();
  }

  addUser(): void {
    const newUserCapacity = this.createUserCapacityFormGroup();
    this.userCapacitiesFormArray.push(newUserCapacity);
    
    // Subscribe to changes for real-time calculations
    this.subscribeToCapacityChanges(newUserCapacity);
  }

  removeUser(index: number): void {
    this.userCapacitiesFormArray.removeAt(index);
    this.calculateCapacitySummary();
  }

  onUserSelect(index: number, userId: number | string): void {
    const parsedId = Number(userId);

    // When showing team members, look up in availableUsers (TeamMember)
    // When showing external users, look up in allUsers
    let selectedName: string | null = null;
    if (!this.showAllUsers) {
      const tm = this.availableUsers.find(u => u.userId === parsedId);
      selectedName = tm ? tm.userName : null;
    } else {
      const ext = this.allUsers.find(u => u.id === parsedId);
      selectedName = ext ? `${ext.firstName ?? ''} ${ext.lastName ?? ''}`.trim() : null;
    }

    if (selectedName) {
      const capacityGroup = this.userCapacitiesFormArray.at(index) as FormGroup;
      capacityGroup.patchValue({
        userName: selectedName,
        userId: parsedId
      });
      this.calculateUserCapacity(index);
  this.updateDisplayedUsers();
  this.cdr.detectChanges();
    }
  }

  private subscribeToCapacityChanges(capacityGroup: FormGroup): void {
    // Recalculate when user selection changes as it can set defaults or reenable fields
    capacityGroup.get('userId')?.valueChanges.subscribe(() => {
      const index = this.userCapacitiesFormArray.controls.indexOf(capacityGroup);
      this.calculateUserCapacity(index); // Normal calculation with summary update
    });

    // Subscribe to capacity percentage changes
    capacityGroup.get('userCapacityPercentage')?.valueChanges.subscribe(() => {
      const index = this.userCapacitiesFormArray.controls.indexOf(capacityGroup);
      this.calculateUserCapacity(index); // Normal calculation with summary update
    });

    // Subscribe to leave days changes
    capacityGroup.get('leaveDays')?.valueChanges.subscribe(() => {
      const index = this.userCapacitiesFormArray.controls.indexOf(capacityGroup);
      this.calculateUserCapacity(index); // Normal calculation with summary update
    });

    // Subscribe to working hours changes
    capacityGroup.get('allocatedHours')?.valueChanges.subscribe(() => {
      const index = this.userCapacitiesFormArray.controls.indexOf(capacityGroup);
      this.calculateUserCapacity(index); // Normal calculation with summary update
    });

    // Subscribe to daily working hours changes (per-row)
    capacityGroup.get('dailyWorkingHours')?.valueChanges.subscribe(() => {
      const index = this.userCapacitiesFormArray.controls.indexOf(capacityGroup);
      this.calculateUserCapacity(index); // Normal calculation with summary update
    });
  this.updateDisplayedUsers();
  }

  private calculateUserCapacity(index: number, skipSummaryCalculation: boolean = false): void {
    const capacityGroup = this.userCapacitiesFormArray.at(index) as FormGroup;
    const fromDateRaw = this.sprintForm.get('fromDate')?.value;
    const toDateRaw = this.sprintForm.get('toDate')?.value;
    const defaultDailyHours = this.sprintForm.get('defaultDailyHours')?.value || 8;

  const fromDate = this.ensureDate(fromDateRaw);
  const toDate = this.ensureDate(toDateRaw);

    // Calculate sprint duration (with fallback if dates are not selected yet)
    let workingDays: number;
    const noOfHolidays = Number(this.sprintForm.get('noOfHolidays')?.value) || 0;
    if (fromDate && toDate) {
      const sprintDays = this.calculateSprintDuration(fromDate, toDate);
      workingDays = Math.max(0, sprintDays - noOfHolidays);
    } else {
      // Fallback working days to keep UI responsive before dates are selected
      const fallbackDays = 10; // two working weeks as an initial estimate
      workingDays = Math.max(0, fallbackDays - noOfHolidays);
    }
    
    // Get user inputs
  const userCapacityPercentage = Number(capacityGroup.get('userCapacityPercentage')?.value) || 100;
  const leaveDays = Number(capacityGroup.get('leaveDays')?.value) || 0;
  const allocatedHours = Number(capacityGroup.get('allocatedHours')?.value) || 0;
  const rowDailyHours = Number(capacityGroup.get('dailyWorkingHours')?.value) || defaultDailyHours;
    
    // Calculate total working hours and available hours
  const totalWorkingHours = Math.max(0, workingDays - leaveDays) * rowDailyHours;
    const availableWorkingHours = (totalWorkingHours * userCapacityPercentage) / 100;
    
    // Calculate utilization percentage
    const utilizationPercentage = availableWorkingHours > 0 ? (allocatedHours / availableWorkingHours) * 100 : 0;
    const isOverAllocated = utilizationPercentage > 100;

    // Update form controls
    capacityGroup.patchValue({
      totalWorkingHours: totalWorkingHours,
      availableWorkingHours: availableWorkingHours,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      isOverAllocated: isOverAllocated
    });

    // Only calculate summary if not skipped (for bulk operations)
    if (!skipSummaryCalculation) {
      this.calculateCapacitySummary();
    }
  this.updateDisplayedUsers();
  this.cdr.detectChanges();
  }

  private recalculateAllCapacities(): void {
    // Recalculate capacity for all users when sprint parameters change
    for (let i = 0; i < this.userCapacitiesFormArray.length; i++) {
      this.calculateUserCapacity(i, true); // Skip individual summary calculations
    }
    // Calculate summary once after all individual calculations
    this.calculateCapacitySummary();
  }

  private calculateSprintDuration(fromDate: Date, toDate: Date): number {
    if (!fromDate || !toDate) return 0;
    const timeDiff = toDate.getTime() - fromDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  private ensureDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private calculateCapacitySummary(): void {
    // Use getRawValue so disabled controls (calculated fields) are included
    const capacities = (this.userCapacitiesFormArray as FormArray).getRawValue();
    
    if (capacities.length === 0) {
      this.capacitySummary = null;
      return;
    }

  const totalMembers = capacities.length;
  const activeMembers = capacities.filter((c: any) => Number(c.userCapacityPercentage) > 0).length;
  const totalCapacityHours = capacities.reduce((sum: number, c: any) => sum + (Number(c.availableWorkingHours) || 0), 0);
  const totalAllocatedHours = capacities.reduce((sum: number, c: any) => sum + (Number(c.allocatedHours) || 0), 0);
  const overAllocatedMembers = capacities.filter((c: any) => !!c.isOverAllocated).length;
    
    const teamUtilization = totalCapacityHours > 0 ? (totalAllocatedHours / totalCapacityHours) * 100 : 0;

    this.capacitySummary = {
      totalTeamMembers: totalMembers,
      activeMembers: activeMembers,
      membersOnLeave: capacities.filter((c: any) => c.leaveDays > 0).length,
      totalCapacityHours: Math.round(totalCapacityHours * 100) / 100,
      totalAllocatedHours: Math.round(totalAllocatedHours * 100) / 100,
      totalRemainingHours: Math.round((totalCapacityHours - totalAllocatedHours) * 100) / 100,
      averageUtilization: Math.round(teamUtilization * 100) / 100,
      totalPotentialHours: Math.round(totalCapacityHours * 100) / 100,
      totalLostHoursToLeave: 0, // TODO: Calculate based on leave days
      totalLostHoursToCapacity: 0, // TODO: Calculate based on capacity percentage
      totalLeaveDays: capacities.reduce((sum: number, c: any) => sum + (c.leaveDays || 0), 0),
      teamEfficiency: Math.round((100 - Math.abs(100 - teamUtilization)) * 100) / 100,
      overAllocatedMembers: overAllocatedMembers,
      underUtilizedMembers: capacities.filter((c: any) => c.utilizationPercentage < 50).length,
      hasCapacityRisks: teamUtilization > 100 || overAllocatedMembers > 0,
      sprintDurationDays: 0, // TODO: Calculate from form dates
      workingDays: 0, // TODO: Calculate from form dates
      holidays: 0 // TODO: Get from form
    };
  }

  onSave(): void {
    if (!this.sprintForm.valid) {
      this.markFormGroupTouched(this.sprintForm);
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    const formValue = this.sprintForm.value;
    
    const sprintData: SprintCreation = {
      sprintName: formValue.sprintName,
      fromDate: formValue.fromDate,
      toDate: formValue.toDate,
      tramId: formValue.tramId,
      sprintPoint: formValue.sprintPoint,
      detailsRemark: formValue.detailsRemark,
      createBy: formValue.createBy,
      noOfHolidays: formValue.noOfHolidays,
      defaultDailyHours: formValue.defaultDailyHours,
      userCapacities: formValue.userCapacities.filter((c: any) => c.userId),
      capacitySummary: this.capacitySummary || undefined
    };

    if (this.data.mode === 'create') {
      this.sprintService.createSprintWithCapacity(sprintData).subscribe({
        next: (result: any) => {
          this.successMessage = 'Sprint created successfully!';
          this.saveComplete.emit(result);
          setTimeout(() => this.onCancel(), 1500);
        },
        error: (error: any) => {
          console.error('Error creating sprint:', error);
          this.errorMessage = 'Error creating sprint';
          this.isLoading = false;
        }
      });
    } else {
      // Edit mode: upsert each user's capacity for this sprint
      const sprintId = Number(this.data.sprint?.id);
      const capacities = (formValue.userCapacities as any[]).filter((c: any) => c.userId);
      const ops = capacities.map((c: any) => {
        const payload = { ...c, sprintId } as SprintUserCapacity;
        return this.sprintService.addOrUpdateUserCapacity(sprintId, payload);
      });
      forkJoin(ops).subscribe({
        next: (result: any) => {
          this.successMessage = 'Sprint capacity updated successfully!';
          this.saveComplete.emit(result);
          setTimeout(() => this.onCancel(), 1000);
        },
        error: (error: any) => {
          console.error('Error updating sprint capacity:', error);
          this.errorMessage = 'Error updating sprint capacity';
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.closeDialog.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Utility methods for template
  getAvailableUsers(): any[] {
  const selectedUserIds = (this.userCapacitiesFormArray as FormArray).getRawValue().map((c: any) => c.userId).filter(Boolean);
  return this.displayedUsers.filter(user => !selectedUserIds.includes(user.id));
  }

  getUserCapacityGroup(index: number): FormGroup {
    return this.userCapacitiesFormArray.at(index) as FormGroup;
  }

  trackByUser = (_: number, item: { id: number }) => item.id;
  trackByIndex = (index: number) => index;

  isOverAllocated(index: number): boolean {
    const group = this.getUserCapacityGroup(index);
    return group.get('isOverAllocated')?.value || false;
  }

  getUtilizationClass(index: number): string {
    const group = this.getUserCapacityGroup(index);
    const utilization = group.get('utilizationPercentage')?.value || 0;
    
    if (utilization > 100) return 'over-allocated';
    if (utilization > 80) return 'high-utilization';
    if (utilization < 50) return 'under-utilized';
    return 'optimal';
  }

  isUserNotInAvailableList(index: number): boolean {
    const userId = this.getUserCapacityGroup(index).get('userId')?.value;
    if (!userId) return false;

    if (!this.showAllUsers) {
      const inTeam = this.availableUsers.some(u => u.userId === userId);
      return !inTeam;
    } else {
      const inExternal = this.allUsers.some(u => u.id === userId);
      return !inExternal;
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Compare function for select controls to avoid string/number mismatch
  compareById(a: any, b: any): boolean {
    // Treat null/undefined as equal only if both are nullish
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    const an = Number(a);
    const bn = Number(b);
    return !isNaN(an) && !isNaN(bn) ? an === bn : a === b;
  }
}
