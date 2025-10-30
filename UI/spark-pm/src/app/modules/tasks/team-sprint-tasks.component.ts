import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TeamSprintTaskService } from './team-sprint-task.service';
import { 
  TeamSprintDto, 
  SprintTaskDto, 
  TaskStatistics, 
  UserTaskSummary,
  TaskFilter,
  DisplayOptions 
} from './team-sprint-task.model';

/**
 * Professional Team Sprint Tasks Component
 * 
 * Provides comprehensive team-based sprint task management with advanced filtering,
 * sorting, and display options. Follows modern Angular patterns with reactive design.
 */
@Component({
  selector: 'app-team-sprint-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-sprint-tasks.component.html',
  styleUrls: ['./team-sprint-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamSprintTasksComponent implements OnInit {
  
  // Reactive state management
  private _teamSprints = signal<TeamSprintDto[]>([]);
  private _selectedTeamId = signal<number | null>(null);
  private _selectedSprintId = signal<number | null>(null);
  private _sprintTasks = signal<SprintTaskDto[]>([]);
  private _taskStatistics = signal<TaskStatistics | null>(null);
  private _userSummary = signal<UserTaskSummary | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Computed properties
  teamSprints = computed(() => this._teamSprints());
  selectedTeamId = computed(() => this._selectedTeamId());
  selectedSprintId = computed(() => this._selectedSprintId());
  sprintTasks = computed(() => this._sprintTasks());
  taskStatistics = computed(() => this._taskStatistics());
  userSummary = computed(() => this._userSummary());
  isLoading = computed(() => this._isLoading());
  error = computed(() => this._error());

  // Derived computed properties
  selectedTeam = computed(() => {
    const teamId = this.selectedTeamId();
    return teamId ? this.teamSprints().find(team => team.teamId === teamId) : null;
  });

  availableSprints = computed(() => {
    const team = this.selectedTeam();
    return team ? team.sprints : [];
  });

  selectedSprint = computed(() => {
    const sprintId = this.selectedSprintId();
    const sprints = this.availableSprints();
    return sprintId ? sprints.find(sprint => sprint.sprintId === sprintId) : null;
  });

  filteredTasks = computed(() => {
    let tasks = this.sprintTasks();
    
    // Apply display filters
    if (!this.displayOptions.showCompleted) {
      tasks = tasks.filter(task => !task.isCompleted);
    }

    // Apply sorting
    tasks = this.sortTasks(tasks);
    
    return tasks;
  });

  groupedTasks = computed(() => {
    const tasks = this.filteredTasks();
    const groupBy = this.displayOptions.groupBy;
    
    if (!groupBy) return { 'All Tasks': tasks };
    
    return tasks.reduce((groups, task) => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          key = this.formatStatus(task.status);
          break;
        case 'priority':
          key = task.priority;
          break;
        case 'assignee':
          key = task.assigneeName || 'Unassigned';
          break;
        default:
          key = 'All Tasks';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
      
      return groups;
    }, {} as Record<string, SprintTaskDto[]>);
  });

  // Display options
  displayOptions: DisplayOptions = {
    viewMode: 'cards',
    sortBy: 'priority',
    sortDirection: 'desc',
    groupBy: 'status',
    showCompleted: false
  };

  // Task filter
  taskFilter: TaskFilter = {};

  // User info
  userInfo = computed(() => ({
    username: this.authService.username(),
    fullName: this.authService.getUserFullName(),
    email: this.authService.getUserEmail(),
    teams: this.authService.getUserTeams(),
    roles: this.authService.getUserRoles()
  }));

  constructor(
    private authService: AuthService,
    private teamSprintTaskService: TeamSprintTaskService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeComponent();
  }

  /**
   * Initialize component with data loading
   */
  private async initializeComponent(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Load user task summary and team sprints in parallel
      const [userSummary, teamSprints] = await Promise.all([
        this.teamSprintTaskService.getUserTaskSummary().toPromise(),
        this.teamSprintTaskService.getUserTeamSprints().toPromise()
      ]);

      this._userSummary.set(userSummary || null);
      this._teamSprints.set(teamSprints || []);

      // Auto-select first team and sprint if available
      if (teamSprints && teamSprints.length > 0) {
        const firstTeam = teamSprints[0];
        this._selectedTeamId.set(firstTeam.teamId);
        
        if (firstTeam.sprints.length > 0) {
          const activeSprint = firstTeam.sprints.find(s => s.isActive) || firstTeam.sprints[0];
          await this.selectSprint(activeSprint.sprintId);
        }
      }

    } catch (error) {
      console.error('Error initializing component:', error);
      this._error.set('Failed to load team sprint data. Please refresh and try again.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Handle team selection change
   */
  async onTeamChange(teamId: number): Promise<void> {
    if (teamId === this.selectedTeamId()) return;

    this._selectedTeamId.set(teamId);
    this._selectedSprintId.set(null);
    this._sprintTasks.set([]);
    this._taskStatistics.set(null);

    // Auto-select first active sprint for the team
    const team = this.selectedTeam();
    if (team && team.sprints.length > 0) {
      const activeSprint = team.sprints.find(s => s.isActive) || team.sprints[0];
      await this.selectSprint(activeSprint.sprintId);
    }
  }

  /**
   * Handle sprint selection change
   */
  async selectSprint(sprintId: number): Promise<void> {
    if (sprintId === this.selectedSprintId()) return;

    this._selectedSprintId.set(sprintId);
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Load sprint tasks and statistics in parallel
      const [sprintTasks, taskStats] = await Promise.all([
        this.teamSprintTaskService.getSprintTasks(sprintId, this.taskFilter).toPromise(),
        this.teamSprintTaskService.getSprintTaskStatistics(sprintId).toPromise()
      ]);

      this._sprintTasks.set(sprintTasks || []);
      this._taskStatistics.set(taskStats || null);

    } catch (error) {
      console.error('Error loading sprint tasks:', error);
      this._error.set('Failed to load sprint tasks. Please try again.');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Refresh all data
   */
  async refresh(): Promise<void> {
    await this.initializeComponent();
  }

  /**
   * Update task status with optimistic updates
   */
  async updateTaskStatus(task: SprintTaskDto, newStatus: string): Promise<void> {
    const originalStatus = task.status;
    
    // Optimistic update
    task.status = newStatus;
    task.isCompleted = ['DONE', 'CANCELLED'].includes(newStatus);
    
    try {
      await this.teamSprintTaskService.updateTaskStatus(task.taskId, newStatus).toPromise();
      
      // Refresh statistics after successful update
      if (this.selectedSprintId()) {
        const stats = await this.teamSprintTaskService.getSprintTaskStatistics(this.selectedSprintId()!).toPromise();
        this._taskStatistics.set(stats || null);
      }
      
    } catch (error) {
      // Rollback on failure
      task.status = originalStatus;
      task.isCompleted = ['DONE', 'CANCELLED'].includes(originalStatus);
      console.error('Error updating task status:', error);
      this._error.set('Failed to update task status. Please try again.');
    }
  }

  /**
   * Sort tasks based on display options
   */
  private sortTasks(tasks: SprintTaskDto[]): SprintTaskDto[] {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (this.displayOptions.sortBy) {
        case 'priority':
          comparison = a.priorityLevel - b.priorityLevel;
          break;
        case 'deadline':
          if (!a.deadline && !b.deadline) comparison = 0;
          else if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created':
          if (!a.createdAt && !b.createdAt) comparison = 0;
          else if (!a.createdAt) comparison = 1;
          else if (!b.createdAt) comparison = -1;
          else comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return this.displayOptions.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Update display options and refresh view
   */
  updateDisplayOptions(options: Partial<DisplayOptions>): void {
    this.displayOptions = { ...this.displayOptions, ...options };
  }

  /**
   * Format status for display
   */
  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get task priority icon
   */
  getPriorityIcon(priority: string): string {
    return this.teamSprintTaskService.getPriorityIcon(priority);
  }

  /**
   * Get task type icon
   */
  getTaskTypeIcon(taskType: string): string {
    return this.teamSprintTaskService.getTaskTypeIcon(taskType);
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    return this.teamSprintTaskService.getStatusIcon(status);
  }

  /**
   * Check if task is overdue
   */
  isTaskOverdue(task: SprintTaskDto): boolean {
    return task.isOverdue;
  }

  /**
   * Get formatted deadline
   */
  getFormattedDeadline(task: SprintTaskDto): string {
    return task.getFormattedDeadline();
  }

  /**
   * Get progress bar width percentage
   */
  getProgressWidth(percentage: number): string {
    return `${Math.max(0, Math.min(100, percentage))}%`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByTaskId(index: number, task: SprintTaskDto): number {
    return task.taskId;
  }

  /**
   * Track by function for teams
   */
  trackByTeamId(index: number, team: TeamSprintDto): number {
    return team.teamId;
  }
}