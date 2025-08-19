
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SprintService } from './sprints.service';
import { Sprint, SprintFormData } from './sprints.model';
import { NotificationService } from '../../core/services/notification.service';
import { TeamService } from '../teams/team.service';
import { Team } from '../teams/team.model';
import { SprintCapacityDialogComponent, SprintCapacityDialogData } from './sprint-capacity-dialog.component';

@Component({
  selector: 'app-sprints',
  standalone: true,
  imports: [CommonModule, FormsModule, SprintCapacityDialogComponent],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsComponent implements OnInit {
  sprints: Sprint[] = [];
  filteredSprints: Sprint[] = [];
  selectedSprint: Sprint | null = null;
  teams: Team[] = [];
  isEdit = false;
  isAdd = false;
  isLoading = false;
  error: string | null = null;
  showDeleteConfirm = false;
  sprintToDelete: Sprint | null = null;
  showSearchPanel = false;

  // Search and filter
  searchTerm = '';
  statusFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalSprints = 0;
  totalPages = 0;

  // Form data
  sprintForm: SprintFormData = {
    sprintName: '',
    noOfHolidays: 0,
    fromDate: '',
    toDate: '',
    tramId: 0,
    sprintPoint: 0,
    detailsRemark: '',
    status: 1
  };

  // Capacity Dialog
  showCapacityDialog = false;
  capacityDialogData: SprintCapacityDialogData = { mode: 'create' };

  constructor(
    private sprintService: SprintService,
    private teamService: TeamService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSprints();
    this.loadTeams();
  }

  loadSprints() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.error = null;
    
    this.sprintService.getAllSprints().subscribe({
      next: (sprints: Sprint[]) => {
        // Keep backend-provided values; avoid forcing ISO that can shift dates
        this.sprints = (sprints || []).map(s => ({ ...s }));
        this.updatePagination();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
  error: (error: any) => {
        this.error = 'Failed to load sprints. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  refreshSprints() {
    this.loadSprints();
    this.notificationService.success('Success', 'Sprints refreshed successfully');
  }

  toggleSearchPanel() {
    this.showSearchPanel = !this.showSearchPanel;
  }

  updatePagination() {
    this.totalSprints = this.sprints.length;
    this.totalPages = Math.ceil(this.totalSprints / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  applyFilters() {
    let filtered = this.sprints.filter(sprint => {
      const matchesSearch = !this.searchTerm || 
        sprint.sprintName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (sprint.detailsRemark && sprint.detailsRemark.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || sprint.status === +this.statusFilter;
      
      let matchesDateRange = true;
      if (this.dateFromFilter || this.dateToFilter) {
        const sprintStart = this.parseDate(sprint.fromDate);
        if (this.dateFromFilter) {
          const fromDate = this.parseDate(this.dateFromFilter);
          matchesDateRange = matchesDateRange && sprintStart >= fromDate;
        }
        if (this.dateToFilter) {
          const toDate = this.parseDate(this.dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && sprintStart <= toDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });

    this.totalSprints = filtered.length;
    this.totalPages = Math.ceil(this.totalSprints / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredSprints = filtered.slice(startIndex, endIndex);
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.currentPage = 1;
    this.applyFilters();
    this.notificationService.success('Success', 'Filters cleared');
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  getStartIndex(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalSprints);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalSprints);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  trackBySprint(index: number, sprint: Sprint): number | undefined {
    return sprint.id;
  }

  // Filter event handlers
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onDateFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  selectSprint(sprint: Sprint) {
    this.selectedSprint = { ...sprint };
    this.sprintForm = {
  sprintName: sprint.sprintName,
  noOfHolidays: sprint.noOfHolidays,
  fromDate: this.toInputDate(sprint.fromDate),
  toDate: this.toInputDate(sprint.toDate),
      tramId: sprint.tramId,
      sprintPoint: sprint.sprintPoint,
      detailsRemark: sprint.detailsRemark || '',
      status: sprint.status
    };
    this.isEdit = true;
    this.isAdd = false;
    this.error = null;
  }

  addSprint() {
    this.selectedSprint = null;
    this.sprintForm = {
      sprintName: '',
      noOfHolidays: 0,
      fromDate: '',
      toDate: '',
      tramId: 0,
      sprintPoint: 0,
      detailsRemark: '',
      status: 1
    };
    this.isAdd = true;
    this.isEdit = false;
    this.error = null;
  }

  saveSprint() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.error = null;

    if (this.isAdd) {
      this.sprintService.createSprint(this.sprintForm).subscribe({
        next: (sprint: Sprint) => {
          this.sprints.push(sprint);
          this.applyFilters();
          this.cancel();
          this.isLoading = false;
          this.notificationService.success('Success', 'Sprint created successfully');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.error = 'Failed to create sprint. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.isEdit && this.selectedSprint) {
      this.sprintService.updateSprint(this.selectedSprint.id!, this.sprintForm).subscribe({
        next: (updatedSprint: Sprint) => {
          const index = this.sprints.findIndex(s => s.id === this.selectedSprint!.id);
          if (index !== -1) {
            this.sprints[index] = updatedSprint;
          }
          this.applyFilters();
          this.cancel();
          this.isLoading = false;
          this.notificationService.success('Success', 'Sprint updated successfully');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.error = 'Failed to update sprint. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDeleteSprint(sprint: Sprint) {
    this.sprintToDelete = sprint;
    this.showDeleteConfirm = true;
  }

  deleteSprint() {
    if (!this.sprintToDelete || this.isLoading) return;
    this.isLoading = true;
    this.error = null;

    this.sprintService.deleteSprint(this.sprintToDelete.id!).subscribe({
      next: () => {
        this.sprints = this.sprints.filter(s => s.id !== this.sprintToDelete!.id);
        this.applyFilters();
        this.cancel();
        this.isLoading = false;
        this.notificationService.success('Success', 'Sprint deleted successfully');
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.error = 'Failed to delete sprint. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.selectedSprint = null;
    this.sprintToDelete = null;
    this.isEdit = false;
    this.isAdd = false;
    this.showDeleteConfirm = false;
    this.error = null;
    this.sprintForm = {
      sprintName: '',
      noOfHolidays: 0,
      fromDate: '',
      toDate: '',
      tramId: 0,
      sprintPoint: 0,
      detailsRemark: '',
      status: 1
    };
  }

  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.teamName : 'Unknown Team';
  }

  getStatusName(status: number): string {
    switch (status) {
      case 1: return 'Active';
      case 0: return 'Inactive';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-active';
      case 0: return 'status-inactive';
      case 2: return 'status-completed';
      default: return 'status-unknown';
    }
  }

  private parseDate(value: string): Date {
    // Supports ISO or yyyy-MM-dd formats
    if (!value) return new Date('');
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    // Try yyyy-MM-dd
    const parts = value.split('-');
    if (parts.length === 3) {
      const [y, m, day] = parts.map(Number);
      const dt = new Date(y, m - 1, day);
      if (!isNaN(dt.getTime())) return dt;
    }
    return new Date(value);
  }

  calculateSprintDuration(fromDate: string, toDate: string): number {
    if (!fromDate || !toDate) return 0;
    const start = this.parseDate(fromDate);
    const end = this.parseDate(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Convert a date value to yyyy-MM-dd for input[type=date]
  private toInputDate(value: string): string {
    if (!value) return '';
    const d = this.parseDate(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Progress helpers for industry-level vibe
  getSprintProgress(sprint: Sprint): number {
    const start = this.parseDate(sprint.fromDate);
    const end = this.parseDate(sprint.toDate);
    const now = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }

  getElapsedDays(sprint: Sprint): number {
    const start = this.parseDate(sprint.fromDate);
    const now = new Date();
    if (isNaN(start.getTime()) || now < start) return 0;
    const diff = now.getTime() - start.getTime();
    return Math.min(this.calculateSprintDuration(sprint.fromDate, sprint.toDate), Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Capacity Dialog Methods
  openCapacityDialog(mode: 'create' | 'edit' = 'create', sprint?: Sprint): void {
    this.capacityDialogData = {
      mode: mode,
      sprint: sprint,
      teamId: sprint?.tramId
    };
    this.showCapacityDialog = true;
  }

  closeCapacityDialog(): void {
    this.showCapacityDialog = false;
  }

  onCapacitySaveComplete(result: any): void {
    if (result) {
      this.notificationService.success(
        'Success',
        `Sprint ${this.capacityDialogData.mode === 'create' ? 'created' : 'updated'} successfully!`
      );
      this.loadSprints(); // Refresh the sprint list
    }
    this.closeCapacityDialog();
  }

  // Enhanced add sprint with capacity planning
  addSprintWithCapacity(): void {
    this.openCapacityDialog('create');
  }

  // Enhanced edit sprint with capacity planning
  editSprintCapacity(sprint: Sprint): void {
    this.openCapacityDialog('edit', sprint);
  }
}
