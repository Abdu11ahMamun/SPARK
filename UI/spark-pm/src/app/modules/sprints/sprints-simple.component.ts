import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SprintService } from './sprint.service';
import { Sprint } from './sprint.model';
import { SprintCapacityDialogComponent, SprintCapacityDialogData } from './sprint-capacity-dialog.component';

@Component({
  selector: 'app-sprints-simple',
  standalone: true,
  imports: [CommonModule, FormsModule, SprintCapacityDialogComponent],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsSimpleComponent implements OnInit {
  title = 'Sprint Management';
  
  // Modal state
  showSprintModal = false;
  activeTab: 'Sprint Declare' | 'Sprint Task Info' = 'Sprint Declare';
  
  // Form properties
  selectedTeam = 'Investment Team';
  sprintName = 'Team - Investment Team | Sprint - 01';
  fromDate = '';
  toDate = '';
  totalSprintDays = 0;
  noOfHolidays = 0;
  sprintPoint = '';
  detailsRemark = '';
  
  // Template required properties
  sprints: Sprint[] = [];
  filteredSprints: Sprint[] = [];
  loading = false;
  isLoading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalSprints = 0;
  showDeleteConfirm = false;
  sprintToDelete: Sprint | null = null;
  showCapacityDialog = false;
  capacityDialogData: SprintCapacityDialogData = { mode: 'create' };
  // Advanced search panel support
  showSearchPanel = false;
  
  // Form properties (empty for simple component)
  isEdit = false;
  isAdd = false;
  selectedSprint: Sprint | null = null;
  sprintForm: any = {};
  
  // Data arrays
  teams = [
  { id: 1, name: 'Investment Team', teamName: 'Investment Team' },
  { id: 2, name: 'Development Team', teamName: 'Development Team' },
  { id: 3, name: 'Testing Team', teamName: 'Testing Team' }
  ];
  
  availableTasks: any[] = [];
  kanbanBoard: { [key: string]: any[] } = { todo: [], inprogress: [], done: [] };
  
  sprintUsers = [
    { id: 1, name: 'Ali Ahmed', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 },
    { id: 2, name: 'Md Saleh Ahmed Kabir', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 }
  ];

  constructor(
    private sprintService: SprintService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSprints();
  }

  loadSprints(): void {
    this.loading = true;
    this.isLoading = true;
    this.sprintService.getAllSprints().subscribe({
      next: (sprints) => {
        this.sprints = sprints;
        this.applyFilters();
        this.loading = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load sprints';
        this.loading = false;
        this.isLoading = false;
      }
    });
  }

  // Advanced search panel handlers
  toggleSearchPanel() { this.showSearchPanel = !this.showSearchPanel; }
  refreshSprints() { this.loadSprints(); }
  addSprintWithCapacity() { this.openCapacityDialog('create'); }

  applyFilters() {
    let filtered = this.sprints;

    if (this.searchTerm) {
      filtered = filtered.filter(sprint => 
        sprint.sprintName?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      const status = parseInt(this.statusFilter);
      filtered = filtered.filter(sprint => sprint.status === status);
    }

    this.totalSprints = filtered.length;
    this.totalPages = Math.ceil(this.totalSprints / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredSprints = filtered.slice(startIndex, endIndex);
  }
  
  // Methods
  openSprintModal() { this.showSprintModal = true; }
  closeSprintModal() { this.showSprintModal = false; }
  setActiveTab(tab: 'Sprint Declare' | 'Sprint Task Info') { this.activeTab = tab; }
  createSprint() { console.log('Create sprint'); this.closeSprintModal(); }
  cancelSprint() { this.closeSprintModal(); }
  editSprint(sprint: any) { this.selectedSprint = sprint; this.openSprintModal(); }
  removeUser(index: number) { this.sprintUsers.splice(index, 1); }
  onDateChange() {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const timeDiff = to.getTime() - from.getTime();
      this.totalSprintDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }
  getTeamName(teamId?: number) {
    const team = this.teams.find(t => t.id === teamId);
    return team?.name || '—';
  }
  addTaskToSprint(task: any) { console.log('Add task to sprint', task); }
  onCardMoved(event: any) { console.log('Card moved', event); }

  // Sprint lifecycle methods (placeholder for now)
  selectSprint(sprint: Sprint) { 
    this.selectedSprint = sprint;
    console.log('Select sprint', sprint); 
  }
  addSprint() { console.log('Add sprint'); }
  saveSprint() { console.log('Save sprint'); }
  deleteSprint() { 
    console.log('Delete sprint', this.sprintToDelete); 
    this.showDeleteConfirm = false;
    this.sprintToDelete = null;
  }
  cancel() { 
    console.log('Cancel'); 
    this.showDeleteConfirm = false;
    this.sprintToDelete = null;
    this.selectedSprint = null;
    this.isEdit = false;
    this.isAdd = false;
  }

  confirmDeleteSprint(sprint: Sprint) {
    this.sprintToDelete = sprint;
    this.showDeleteConfirm = true;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
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

  // Status helpers
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

  // Navigation
  gotoDetails(sprint: Sprint): void {
    console.log('SprintsSimpleComponent - gotoDetails called with sprint:', sprint);
    if (!sprint?.id) return;
    
    console.log('SprintsSimpleComponent - About to navigate to:', ['/sprints', sprint.id]);
    this.router.navigate(['/sprints', sprint.id]).then(success => {
      console.log('SprintsSimpleComponent - Navigation result:', success);
    }).catch(error => {
      console.error('SprintsSimpleComponent - Navigation error:', error);
    });
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
      console.log('Sprint capacity save completed');
      this.loadSprints(); // Refresh the sprint list
    }
    this.closeCapacityDialog();
  }

  editSprintCapacity(sprint: Sprint): void {
    this.openCapacityDialog('edit', sprint);
  }

  // Progress helpers
  getSprintProgress(sprint: Sprint): number {
    const start = new Date(sprint.fromDate);
    const end = new Date(sprint.toDate);
    const now = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }

  calculateSprintDuration(fromDate: string, toDate: string): number {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getElapsedDays(sprint: Sprint): number {
    const start = new Date(sprint.fromDate);
    const now = new Date();
    if (isNaN(start.getTime()) || now < start) return 0;
    const diff = now.getTime() - start.getTime();
    return Math.min(this.calculateSprintDuration(sprint.fromDate, sprint.toDate), Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Filter methods
  clearFilters() { 
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }
  
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

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  trackBySprint(index: number, sprint: Sprint): number | undefined {
    return sprint.id;
  }
}
