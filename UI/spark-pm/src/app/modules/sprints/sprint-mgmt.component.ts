import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { SprintService, Sprint, SprintFormData } from './sprint.service';
import { KanbanComponent } from './kanban.component';

// Interfaces for professional sprint management
export interface Team {
  id: number;
  name: string;
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, KanbanComponent],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintMgmtComponent implements OnInit, AfterViewInit {
  @ViewChild('teamChart') teamChartRef!: ElementRef;
  @ViewChild('burndownChart') burndownChartRef!: ElementRef;

  sprints: Sprint[] = [];
  sprintForm: FormGroup;
  sprintCreationForm: FormGroup;
  selectedSprint: Sprint | null = null;
  currentSprint: Sprint | null = null;
  isEditing = false;
  showForm = false;
  showSprintCreationDialog = false;
  loading = false;
  error: string | null = null;
  
  // Filter and search
  searchTerm = '';
  statusFilter = '';
  
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
    private fb: FormBuilder
  ) {
    this.sprintForm = this.createSprintForm();
    this.sprintCreationForm = this.createSprintCreationForm();
  }

  ngOnInit(): void {
    this.loadSprints();
    this.loadMockData();
    this.loadTeams();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // Methods needed by the shared template
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

  getTeamName(teamId?: number): string {
    const team = this.availableTeams.find(t => t.id === teamId);
    return team?.name || '—';
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

  selectSprint(sprint: Sprint): void {
    this.selectedSprint = sprint;
    this.showForm = false;
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
    this.sprintForm.reset();
    this.sprintForm.patchValue({ status: 1, noOfHolidays: 0, tramId: 0, sprintPoint: 0 });
    this.showForm = true;
  }

  editSprint(sprint: Sprint): void {
    this.isEditing = true;
    this.selectedSprint = sprint;
    this.sprintForm.patchValue(sprint);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedSprint = null;
    this.sprintForm.reset();
  }

  onSubmit(): void {
    if (this.sprintForm.valid) {
      const formData: SprintFormData = this.sprintForm.value;
      
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

  deleteSprint(sprint: Sprint): void {
    if (confirm('Are you sure you want to delete sprint "' + sprint.sprintName + '"?')) {
      this.sprintService.deleteSprint(sprint.id!).subscribe({
        next: () => {
          this.loadSprints();
        },
        error: (error: any) => {
          this.error = 'Failed to delete sprint';
          console.error('Error deleting sprint:', error);
        }
      });
    }
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
      { id: 1, name: 'Investment Team', description: 'Core investment and financial services team' },
      { id: 2, name: 'Development Team', description: 'Software development team' },
      { id: 3, name: 'QA Team', description: 'Quality assurance team' },
      { id: 4, name: 'DevOps Team', description: 'Infrastructure and deployment team' }
    ];
    // Also populate the teams array for template
    this.teams = this.availableTeams;
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
