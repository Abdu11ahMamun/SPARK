import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SprintService, Sprint, SprintFormData } from './sprint.service';
import { SprintCapacityDialogComponent, SprintCapacityDialogData } from './sprint-capacity-dialog.component';

// Interfaces for professional sprint management
export interface Team {
  id: number;
  name: string;
  teamName?: string; // for template compatibility
  description?: string;
}

export interface SprintUser {
  id: number;
  name: string;
  userCapacity: number; // percentage (0-100)
  leaveDays: number;
  totalWorkingHour: number; // Changed from totalWorkingHours to match template
  userWorkingHour: number; // Changed from userWorkingHours to match template
  isActive: boolean;
}

export interface SprintCreationData {
  teamId: number;
  teamName: string;
  sprintName: string;
  fromDate: string;
  toDate: string;
  totalSprintDays: number;
  noOfHolidays: number;
  sprintPoint: number;
  detailsRemark?: string;
  users: SprintUser[];
}

export interface SprintTask {
  id?: number;
  mitsId: string;
  assignment: string;
  taskType: string;
  product: string;
  client: string;
  releaseSprint: number;
  priority: string;
  taskCategory: string;
  pointPerson: string;
  status: string;
  storySize: number;
  timeEstimate: number;
  completed: number;
  sprintId?: number;
}

export interface SprintDetails {
  productOwner: string;
  scrumMaster: string;
  teamVelocity: string;
  totalTasks: number;
  assignedPoints: number;
  tasksAssigned: number;
  tasksCompleted: number;
  currentVelocity: string;
  teamCapacity: number;
  totalTeamWorkingHours: number;
}

export interface SprintGoal {
  type: string;
  description: string;
  status: string;
  completed: boolean;
}

export interface BurndownData {
  date: string;
  tasksRemaining: number;
}

@Component({
  selector: 'app-sprint-mgmt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SprintCapacityDialogComponent],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintMgmtComponent implements OnInit, AfterViewInit {
  @ViewChild('teamChart') teamChartRef!: ElementRef;
  @ViewChild('burndownChart') burndownChartRef!: ElementRef;

  sprints: Sprint[] = [];
  // Template model object and reactive form separated
  sprintForm: {
    sprintName: string;
    noOfHolidays: number;
    fromDate: string;
    toDate: string;
    tramId: number;
    sprintPoint: number;
    detailsRemark: string;
    status: number;
    comments?: string;
    sprintOutcome?: string;
  };
  reactiveSprintForm: FormGroup;
  sprintCreationForm: FormGroup;
  selectedSprint: Sprint | null = null;
  currentSprint: Sprint | null = null;
  isEditing = false;
  showForm = false;
  showSprintCreationDialog = false;
  loading = false;
  isLoading = false;
  error: string | null = null;
  
  // Template required properties
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
  // Advanced search panel
  showSearchPanel = false;
  
  // Form properties for compatibility
  isEdit = false;
  isAdd = false;
  
  // Form properties needed by template
  selectedTeam = 'Investment Team';
  sprintName = 'Team - Investment Team | Sprint - 01';
  fromDate = '';
  toDate = '';
  totalSprintDays = 0;
  noOfHolidays = 0;
  sprintPoint = '';
  detailsRemark = '';
  
  // Modal state
  showSprintModal = false;
  activeTab: 'Sprint Declare' | 'Sprint Task Info' = 'Sprint Declare';
  
  // Template properties
  teams: Team[] = [];
  availableTasks: any[] = [];
  kanbanBoard: { [key: string]: any[] } = { todo: [], inprogress: [], done: [] };
  
  // Sprint creation data
  availableTeams: Team[] = [];
  selectedTeamObj: Team | null = null;
  sprintUsers: SprintUser[] = [];
  sprintCreationData: SprintCreationData | null = null;
  
  // Sprint details data
  sprintDetails: SprintDetails | null = null;
  sprintTasks: SprintTask[] = [];
  sprintGoals: SprintGoal[] = [];
  burndownData: BurndownData[] = [];
  
  // Charts
  teamChart: any = null;
  burndownChart: any = null;

  constructor(
    private sprintService: SprintService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.reactiveSprintForm = this.createSprintForm();
    this.sprintForm = {
      sprintName: '',
      noOfHolidays: 0,
      fromDate: '',
      toDate: '',
      tramId: 0,
      sprintPoint: 0,
      detailsRemark: '',
      status: 1,
      comments: '',
      sprintOutcome: ''
    };
    this.sprintCreationForm = this.createSprintCreationForm();
  }

  ngOnInit(): void {
    this.loadSprints();
    this.loadTeams();
    this.loadMockData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // Methods needed by the shared template
  toggleSearchPanel(): void {
    this.showSearchPanel = !this.showSearchPanel;
  }

  refreshSprints(): void {
    if (!this.isLoading) {
      this.loadSprints();
    }
  }

  addSprintWithCapacity(): void {
    this.openCapacityDialog('create');
  }
  openSprintModal(): void {
    this.showSprintModal = true;
  }

  closeSprintModal(): void {
    this.showSprintModal = false;
  }

  setActiveTab(tab: 'Sprint Declare' | 'Sprint Task Info'): void {
    this.activeTab = tab;
  }

  createSprint(): void {
    // Delegate to existing createSprintWithUsers method
    this.createSprintWithUsers();
  }

  cancelSprint(): void {
    this.closeSprintModal();
  }

  addTaskToSprint(task: any): void {
    // Implementation for adding task to sprint
    console.log('Adding task to sprint:', task);
  }

  onCardMoved(event: any): void {
    // Implementation for kanban card movement
    console.log('Card moved:', event);
  }

  get filteredSprints(): Sprint[] {
    let filtered = this.sprints;
    
    if (this.searchTerm) {
      filtered = filtered.filter(sprint => 
        sprint.sprintName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    if (this.statusFilter) {
      filtered = filtered.filter(sprint => 
        sprint.status.toString() === this.statusFilter
      );
    }
    
    return filtered;
  }

  loadMockData(): void {
    // Mock data based on your screenshots
    this.sprintDetails = {
      productOwner: 'Mr. Afsan',
      scrumMaster: 'Mr. Saleh',
      teamVelocity: 'Pts.',
      totalTasks: 40,
      assignedPoints: 221,
      tasksAssigned: 33,
      tasksCompleted: 1,
      currentVelocity: '08.64%',
      teamCapacity: 100,
      totalTeamWorkingHours: 320
    };

    this.sprintTasks = [
      {
        mitsId: 'v836',
        assignment: 'Merge URL Release Branch to URL Master Branch (15641, 17546)',
        taskType: 'Planned',
        product: 'ATM',
        client: 'Millennium',
        releaseSprint: 28,
        priority: 'High',
        taskCategory: 'Development',
        pointPerson: 'Rahmatullah',
        status: 'Untouched',
        storySize: 3,
        timeEstimate: 8,
        completed: 0
      },
      {
        mitsId: 'v745',
        assignment: 'Add Branch is Head office flag in Session Data',
        taskType: 'Planned',
        product: 'Nucleus',
        client: 'Millennium',
        releaseSprint: 28,
        priority: 'High',
        taskCategory: 'Development',
        pointPerson: 'Afsan',
        status: 'In Progress',
        storySize: 3,
        timeEstimate: 8,
        completed: 0
      },
      {
        mitsId: 'v804',
        assignment: 'Data Sync Process by MITS HR | Data Get from Sylhet to AhakiLo. Login restricting employee login access to HRM systems when on leave.',
        taskType: 'Planned',
        product: 'Auth',
        client: 'AIBL',
        releaseSprint: 33,
        priority: 'High',
        taskCategory: 'Testing',
        pointPerson: 'Nasirun',
        status: 'Untouched',
        storySize: 9,
        timeEstimate: 16,
        completed: 0
      },
      {
        mitsId: 'v794',
        assignment: 'BEFTN disbursement facilities',
        taskType: 'Planned',
        product: 'EFT Nucleus',
        client: 'Millennium',
        releaseSprint: 28,
        priority: 'High',
        taskCategory: 'Development',
        pointPerson: 'Rubel',
        status: 'In Progress',
        storySize: 9,
        timeEstimate: 48,
        completed: 0
      }
    ];

    this.sprintGoals = [
      {
        type: 'MITS',
        description: 'BEFTN and BACPS Archiving complete and delivery at NBL',
        status: 'Dead line before end of August',
        completed: false
      },
      {
        type: 'RTGS',
        description: 'RTGS NG report listing and Data dictionary knowledge sharing with report team',
        status: 'Archiving design',
        completed: false
      },
      {
        type: 'RTGS',
        description: 'RTGS NG delivery for testing',
        status: '',
        completed: false
      },
      {
        type: 'ATM',
        description: 'ATM transaction layer restructuring',
        status: '',
        completed: false
      },
      {
        type: 'NCC',
        description: 'NCC API for fund transfer through cheque Implementation',
        status: '',
        completed: false
      },
      {
        type: 'Kubernetes',
        description: 'Kubernetes deployment at AIBL',
        status: '',
        completed: false
      }
    ];

    this.burndownData = [
      { date: '14-Aug-25', tasksRemaining: 40 },
      { date: '15-Aug-25', tasksRemaining: 39 },
      { date: '16-Aug-25', tasksRemaining: 39 },
      { date: '17-Aug-25', tasksRemaining: 39 },
      { date: '18-Aug-25', tasksRemaining: 39 },
      { date: '19-Aug-25', tasksRemaining: 39 },
      { date: '20-Aug-25', tasksRemaining: 39 },
      { date: '21-Aug-25', tasksRemaining: 39 },
      { date: '22-Aug-25', tasksRemaining: 39 },
      { date: '23-Aug-25', tasksRemaining: 39 },
      { date: '24-Aug-25', tasksRemaining: 39 },
      { date: '25-Aug-25', tasksRemaining: 39 },
      { date: '26-Aug-25', tasksRemaining: 39 },
      { date: '27-Aug-25', tasksRemaining: 39 }
    ];

    // Create a mock current sprint
    this.currentSprint = {
      id: 33,
      sprintName: 'Sprint 33',
      noOfHolidays: 0,
      fromDate: '2025-08-14',
      toDate: '2025-08-31',
      tramId: 1,
      sprintPoint: 256,
      status: 1
    };

    // Set selected sprint to current sprint for demonstration
    this.selectedSprint = this.currentSprint;
  }

  initializeCharts(): void {
    // Placeholder for chart initialization
    console.log('Charts will be initialized here when Chart.js is installed');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  }

  getSprintDays(sprint: Sprint): number {
    const startDate = new Date(sprint.fromDate);
    const endDate = new Date(sprint.toDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays - sprint.noOfHolidays;
  }

  getSprintDuration(sprint: Sprint): string {
    const workingDays = this.getSprintDays(sprint);
    const totalDays = Math.ceil(Math.abs(new Date(sprint.toDate).getTime() - new Date(sprint.fromDate).getTime()) / (1000 * 60 * 60 * 24));
    return `${workingDays} Working days (excluding sprint planning day) | ${totalDays}/18 Calendar days remaining`;
  }

  getAchievementPercentage(): number {
    if (!this.sprintDetails) return 0;
    return Math.round((this.sprintDetails.tasksCompleted / this.sprintDetails.tasksAssigned) * 100);
  }

  getSPI(): string {
    return '0.01';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'active';
      case 0: return 'inactive';
      case 2: return 'completed';
      default: return '';
    }
  }

  exportSprintReport(): void {
    alert('Export functionality will be implemented');
  }

  editTask(task: SprintTask): void {
    console.log('Edit task:', task);
  }

  deleteTask(task: SprintTask): void {
    if (confirm(`Are you sure you want to delete task ${task.mitsId}?`)) {
      const index = this.sprintTasks.findIndex(t => t.mitsId === task.mitsId);
      if (index > -1) {
        this.sprintTasks.splice(index, 1);
      }
    }
  }

  createSprintForm(): FormGroup {
    return this.fb.group({
      sprintName: ['', [Validators.required, Validators.maxLength(100)]],
      noOfHolidays: [0, [Validators.required, Validators.min(0)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      tramId: [0, [Validators.required, Validators.min(1)]],
      sprintPoint: [0, [Validators.required, Validators.min(0)]],
      detailsRemark: ['', Validators.maxLength(1000)],
      status: [1, Validators.required],
      comments: [''],
      sprintOutcome: ['']
    });
  }

  loadSprints(): void {
    this.loading = true;
    this.sprintService.getAllSprints().subscribe({
      next: (sprints: Sprint[]) => {
        this.sprints = sprints;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load sprints';
        this.loading = false;
        console.error('Error loading sprints:', error);
      }
    });
  }

  showCreateForm(): void {
    this.isEditing = false;
    this.selectedSprint = null;
  this.reactiveSprintForm.reset();
  this.reactiveSprintForm.patchValue({ status: 1, noOfHolidays: 0, tramId: 0, sprintPoint: 0 });
  this.sprintForm = { sprintName: '', noOfHolidays: 0, fromDate: '', toDate: '', tramId: 0, sprintPoint: 0, detailsRemark: '', status: 1, comments: '', sprintOutcome: '' };
    this.showForm = true;
  }

  editSprint(sprint: Sprint): void {
    this.isEditing = true;
    this.selectedSprint = sprint;
  this.reactiveSprintForm.patchValue(sprint as any);
  this.sprintForm = { ...this.sprintForm, ...sprint } as any;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedSprint = null;
  this.reactiveSprintForm.reset();
  }

  onSubmit(): void {
    if (this.reactiveSprintForm.valid) {
      // merge template model and reactive form values
      const formData: SprintFormData = { ...this.reactiveSprintForm.value, ...this.sprintForm } as SprintFormData;
      
      if (this.isEditing && this.selectedSprint) {
        this.sprintService.updateSprint(this.selectedSprint.id!, formData).subscribe({
          next: () => {
            this.loadSprints();
            this.cancelForm();
          },
          error: (error: any) => {
            this.error = 'Failed to update sprint';
            console.error('Error updating sprint:', error);
          }
        });
      } else {
        this.sprintService.createSprint(formData).subscribe({
          next: () => {
            this.loadSprints();
            this.cancelForm();
          },
          error: (error: any) => {
            this.error = 'Failed to create sprint';
            console.error('Error creating sprint:', error);
          }
        });
      }
    }
  }

  deleteSprint(sprint?: Sprint): void {
    const target = sprint || this.sprintToDelete;
    if (!target) return;
    if (confirm('Are you sure you want to delete sprint "' + target.sprintName + '"?')) {
      this.isLoading = true;
      this.sprintService.deleteSprint(target.id!).subscribe({
        next: () => {
          this.isLoading = false;
          this.showDeleteConfirm = false;
          this.sprintToDelete = null;
          this.loadSprints();
        },
        error: (error: any) => {
          this.error = 'Failed to delete sprint';
          this.isLoading = false;
          console.error('Error deleting sprint:', error);
        }
      });
    }
  }

  // Additional template methods required by shared template
  confirmDeleteSprint(sprint: Sprint) {
    this.sprintToDelete = sprint;
    this.showDeleteConfirm = true;
  }

  cancel() {
    this.showDeleteConfirm = false;
    this.sprintToDelete = null;
    this.selectedSprint = null;
    this.isEdit = false;
    this.isAdd = false;
    this.showForm = false;
    this.isEditing = false;
  }

  addSprint() {
    this.isAdd = true;
    this.isEdit = false;
    this.showForm = true;
    this.isEditing = false;
    this.selectedSprint = null;
  this.reactiveSprintForm.reset();
  this.sprintForm = { sprintName: '', noOfHolidays: 0, fromDate: '', toDate: '', tramId: 0, sprintPoint: 0, detailsRemark: '', status: 1, comments: '', sprintOutcome: '' };
  }

  saveSprint() {
    this.onSubmit();
  }

  selectSprint(sprint: Sprint): void {
    this.selectedSprint = sprint;
    this.isEdit = true;
    this.isAdd = false;
    this.showForm = true;
    this.isEditing = true;
  this.reactiveSprintForm.patchValue(sprint as any);
  this.sprintForm = { ...this.sprintForm, ...sprint } as any;
  }

  // Navigation
  gotoDetails(sprint: Sprint): void {
    if (!sprint?.id) return;
    this.router.navigate(['/sprints', sprint.id]);
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  getStartIndex(): number {
    if (this.totalSprints === 0) return 0;
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

  // Filter methods
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
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.sprints = filtered.slice(startIndex, endIndex);
  }

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
  
  // Unified getTeamName used by template (searches both loaded and available teams)
  getTeamName(teamId?: number): string {
    if (teamId == null) return '—';
    const team = this.teams.find(t => t.id === teamId) || this.availableTeams.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
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

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Active';
      case 0: return 'Inactive';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  dismissError(): void {
    this.error = null;
  }

  // Sprint Creation Methods
  loadTeams(): void {
    // Mock teams data - replace with actual API call
    this.availableTeams = [
      { id: 1, name: 'Investment Team', teamName: 'Investment Team', description: 'Core investment and financial services team' },
      { id: 2, name: 'Development Team', teamName: 'Development Team', description: 'Software development team' },
      { id: 3, name: 'QA Team', teamName: 'QA Team', description: 'Quality assurance team' },
      { id: 4, name: 'DevOps Team', teamName: 'DevOps Team', description: 'Infrastructure and deployment team' }
    ];
    // Also populate the teams array for template
    this.teams = this.availableTeams.map(t => ({ ...t }));
  }

  createSprintCreationForm(): FormGroup {
    return this.fb.group({
      teamId: ['', Validators.required],
      sprintName: ['', [Validators.required, Validators.maxLength(100)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      noOfHolidays: [0, [Validators.required, Validators.min(0)]],
      sprintPoint: [0, [Validators.required, Validators.min(0)]],
      detailsRemark: ['', Validators.maxLength(1000)]
    });
  }

  showSprintCreationModal(): void {
    this.showSprintCreationDialog = true;
    this.sprintCreationForm.reset();
    this.sprintUsers = [];
    this.selectedTeamObj = null;
  }

  closeSprintCreationModal(): void {
    this.showSprintCreationDialog = false;
    this.sprintCreationForm.reset();
    this.sprintUsers = [];
    this.selectedTeamObj = null;
  }

  onTeamChange(): void {
    const teamId = this.sprintCreationForm.get('teamId')?.value;
    if (teamId) {
      this.selectedTeamObj = this.availableTeams.find(team => team.id === parseInt(teamId)) || null;
      this.loadTeamUsers(parseInt(teamId));
    }
  }

  loadTeamUsers(teamId: number): void {
    // Mock team users - replace with actual API call
    const mockUsers: SprintUser[] = [
      { id: 1, name: 'Ali Ahmed', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0, isActive: true },
      { id: 2, name: 'Md Saleh Ahmed Kabir', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0, isActive: true },
      { id: 3, name: 'Rakibul Islam', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0, isActive: true },
      { id: 4, name: 'Jyoti ROy', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0, isActive: true }
    ];
    
    this.sprintUsers = mockUsers.map(user => ({ ...user }));
    this.calculateWorkingHours();
  }

  onDateChange(): void {
    this.calculateWorkingHours();
  }

  calculateWorkingHours(): void {
    const fromDate = this.sprintCreationForm.get('fromDate')?.value;
    const toDate = this.sprintCreationForm.get('toDate')?.value;
    const holidays = this.sprintCreationForm.get('noOfHolidays')?.value || 0;

    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const workingDays = totalDays - holidays;
      
      // Update form with total sprint days
      this.sprintCreationForm.patchValue({
        totalSprintDays: totalDays
      });

      // Calculate working hours for each user
      this.sprintUsers.forEach(user => {
        const userWorkingDays = workingDays - user.leaveDays;
        user.totalWorkingHour = workingDays * 8; // 8 hours per day
        user.userWorkingHour = Math.max(0, userWorkingDays * 8 * (user.userCapacity / 100));
      });
    }
  }

  updateUserCapacity(user: SprintUser): void {
    this.calculateWorkingHours();
  }

  updateUserLeaveDays(user: SprintUser): void {
    this.calculateWorkingHours();
  }

  removeUser(index: number): void {
    if (confirm('Are you sure you want to remove this user from the sprint?')) {
      this.sprintUsers.splice(index, 1);
    }
  }

  getTotalTeamCapacity(): number {
    return this.sprintUsers.reduce((total, user) => total + user.userWorkingHour, 0);
  }

  createSprintWithUsers(): void {
    if (this.sprintCreationForm.valid && this.sprintUsers.length > 0) {
      const formData = this.sprintCreationForm.value;
      
      const sprintCreationData: SprintCreationData = {
        teamId: formData.teamId,
        teamName: this.selectedTeamObj?.name || '',
        sprintName: formData.sprintName,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        totalSprintDays: this.calculateTotalDays(formData.fromDate, formData.toDate),
        noOfHolidays: formData.noOfHolidays,
        sprintPoint: formData.sprintPoint,
        detailsRemark: formData.detailsRemark,
        users: this.sprintUsers
      };

      // TODO: Call API to create sprint with users
      console.log('Creating sprint with data:', sprintCreationData);
      
      // For now, add to local sprints list
      const newSprint: Sprint = {
        id: Date.now(),
        sprintName: sprintCreationData.sprintName,
        noOfHolidays: sprintCreationData.noOfHolidays,
        fromDate: sprintCreationData.fromDate,
        toDate: sprintCreationData.toDate,
        tramId: sprintCreationData.teamId,
        sprintPoint: sprintCreationData.sprintPoint,
        detailsRemark: sprintCreationData.detailsRemark,
        status: 1
      };

      this.sprints.push(newSprint);
      this.closeSprintCreationModal();
      
      // Show success message
      alert('Sprint created successfully with team capacity planning!');
    } else {
      this.error = 'Please fill all required fields and add team members';
    }
  }

  private calculateTotalDays(fromDate: string, toDate: string): number {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
}
