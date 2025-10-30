/**
 * Professional Team Sprint Task Models
 * 
 * TypeScript interfaces for team-based sprint task management
 * Corresponds to backend DTOs for seamless integration
 */

export interface TeamSprintDto {
  teamId: number;
  teamName: string;
  teamDescription?: string;
  teamMemberCount: number;
  sprints: SprintInfo[];
  totalActiveSprints: number;
  tasksInProgress: number;
  completedTasks: number;
}

export interface SprintInfo {
  sprintId: number;
  sprintName: string;
  fromDate: string;
  toDate: string;
  status: number;
  isActive: boolean;
  taskCount: number;
  completedTaskCount: number;
  progressPercentage: number;
}

export interface SprintTaskDto {
  // Task identification
  taskId: number;
  title: string;
  description?: string;
  mitsNo: string;
  taskType: string;
  
  // Task properties
  status: string;
  priority: string;
  deadline?: string;
  points?: number;
  
  // Progress and completion
  progressPercentage: number;
  isCompleted: boolean;
  isOverdue: boolean;
  
  // Assignee information
  assigneeId?: number;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeUsername?: string;
  
  // Sprint information
  sprintId: number;
  sprintName: string;
  sprintFromDate: string;
  sprintToDate: string;
  
  // Team information
  teamId: number;
  teamName: string;
  
  // Product information
  productId?: number;
  productName?: string;
  productModuleId?: number;
  productModuleName?: string;
  
  // Display properties
  statusColor: string;
  priorityLevel: number;
  priorityColor: string;
  taskTypeIcon: string;
  
  // Dates
  createdAt?: string;
  updatedAt?: string;
  
  // Additional metadata
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  comments?: string;
  
  // Helper methods
  getDaysUntilDeadline(): number;
  getFormattedDeadline(): string;
  getTaskTypeClass(): string;
  getPriorityClass(): string;
  getStatusClass(): string;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}

export interface UserTaskSummary {
  activeTeams: number;
  totalSprints: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  lastUpdated: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  status: number;
}

// Filter and display options
export interface TaskFilter {
  teamId?: number;
  sprintId?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface DisplayOptions {
  viewMode: 'cards' | 'list' | 'kanban';
  sortBy: 'priority' | 'deadline' | 'status' | 'created';
  sortDirection: 'asc' | 'desc';
  groupBy?: 'status' | 'priority' | 'assignee';
  showCompleted: boolean;
}