import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  TeamSprintDto, 
  SprintTaskDto, 
  TaskStatistics, 
  UserTaskSummary, 
  ApiResponse,
  TaskFilter 
} from './team-sprint-task.model';

/**
 * Professional Team Sprint Task Service
 * 
 * Provides comprehensive API integration for team-based sprint task management
 * with advanced filtering, sorting, and data aggregation capabilities.
 */
@Injectable({
  providedIn: 'root'
})
export class TeamSprintTaskService {
  private readonly apiUrl = environment.apiUrl + '/api/team-sprint-tasks';

  constructor(private http: HttpClient) {}

  /**
   * Get user's teams with their current active sprints
   * 
   * @returns Observable<TeamSprintDto[]> List of teams with sprint information
   */
  getUserTeamSprints(): Observable<TeamSprintDto[]> {
    return this.http.get<ApiResponse<TeamSprintDto[]>>(`${this.apiUrl}/user/team-sprints`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to retrieve team sprints');
        }),
        catchError(error => {
          console.error('Error fetching user team sprints:', error);
          return throwError(() => new Error('Unable to load team sprints. Please try again.'));
        })
      );
  }

  /**
   * Get tasks for a specific sprint with comprehensive filtering
   * 
   * @param sprintId Sprint identifier
   * @param filter Optional filter parameters
   * @returns Observable<SprintTaskDto[]> List of tasks for the sprint
   */
  getSprintTasks(sprintId: number, filter?: TaskFilter): Observable<SprintTaskDto[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.priority) params = params.set('priority', filter.priority);
      if (filter.assigneeId) params = params.set('assigneeId', filter.assigneeId.toString());
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }

    return this.http.get<ApiResponse<SprintTaskDto[]>>(`${this.apiUrl}/sprint/${sprintId}/tasks`, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data.map(task => this.enhanceTaskWithHelpers(task));
          }
          throw new Error(response.message || 'Failed to retrieve sprint tasks');
        }),
        catchError(error => {
          console.error('Error fetching sprint tasks:', error);
          return throwError(() => new Error('Unable to load sprint tasks. Please try again.'));
        })
      );
  }

  /**
   * Get comprehensive task statistics for a sprint
   * 
   * @param sprintId Sprint identifier
   * @returns Observable<TaskStatistics> Statistical overview of sprint tasks
   */
  getSprintTaskStatistics(sprintId: number): Observable<TaskStatistics> {
    return this.http.get<ApiResponse<TaskStatistics>>(`${this.apiUrl}/sprint/${sprintId}/statistics`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to retrieve task statistics');
        }),
        catchError(error => {
          console.error('Error fetching task statistics:', error);
          return throwError(() => new Error('Unable to load task statistics. Please try again.'));
        })
      );
  }

  /**
   * Get user's comprehensive task summary across all teams and sprints
   * 
   * @returns Observable<UserTaskSummary> User's task summary
   */
  getUserTaskSummary(): Observable<UserTaskSummary> {
    return this.http.get<ApiResponse<UserTaskSummary>>(`${this.apiUrl}/user/summary`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to retrieve user summary');
        }),
        catchError(error => {
          console.error('Error fetching user task summary:', error);
          return throwError(() => new Error('Unable to load task summary. Please try again.'));
        })
      );
  }

  /**
   * Update task status with optimistic updates
   * 
   * @param taskId Task identifier
   * @param newStatus New task status
   * @returns Observable<SprintTaskDto> Updated task information
   */
  updateTaskStatus(taskId: number, newStatus: string): Observable<SprintTaskDto> {
    return this.http.patch<ApiResponse<SprintTaskDto>>(
      `${this.apiUrl}/task/${taskId}/status`, 
      { status: newStatus }
    ).pipe(
      map(response => {
        if (response.success) {
          return this.enhanceTaskWithHelpers(response.data);
        }
        throw new Error(response.message || 'Failed to update task status');
      }),
      catchError(error => {
        console.error('Error updating task status:', error);
        return throwError(() => new Error('Unable to update task status. Please try again.'));
      })
    );
  }

  /**
   * Enhance task object with helper methods for UI display
   * 
   * @param task Sprint task DTO
   * @returns Enhanced task with helper methods
   */
  private enhanceTaskWithHelpers(task: SprintTaskDto): SprintTaskDto {
    return {
      ...task,
      getDaysUntilDeadline: (): number => {
        if (!task.deadline) return 0;
        const today = new Date();
        const deadlineDate = new Date(task.deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },
      getFormattedDeadline: (): string => {
        if (!task.deadline) return 'No deadline';
        const days = task.getDaysUntilDeadline();
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        if (days > 0) return `Due in ${days} days`;
        return `${Math.abs(days)} days overdue`;
      },
      getTaskTypeClass: (): string => {
        const type = task.taskType.toLowerCase();
        if (type.includes('bug')) return 'task-type-bug';
        if (type.includes('feature')) return 'task-type-feature';
        if (type.includes('improvement')) return 'task-type-improvement';
        if (type.includes('story')) return 'task-type-story';
        return 'task-type-default';
      },
      getPriorityClass: (): string => {
        const priority = task.priority.toLowerCase();
        switch (priority) {
          case 'critical': return 'priority-critical';
          case 'high': return 'priority-high';
          case 'medium': return 'priority-medium';
          case 'low': return 'priority-low';
          default: return 'priority-default';
        }
      },
      getStatusClass: (): string => {
        const status = task.status.toLowerCase();
        switch (status) {
          case 'open': return 'status-open';
          case 'in_progress': return 'status-progress';
          case 'blocked': return 'status-blocked';
          case 'done': return 'status-completed';
          case 'cancelled': return 'status-cancelled';
          default: return 'status-default';
        }
      }
    };
  }

  /**
   * Get priority icon for display
   * 
   * @param priority Task priority level
   * @returns Icon string for priority
   */
  getPriorityIcon(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '📌';
    }
  }

  /**
   * Get task type icon for display
   * 
   * @param taskType Task type
   * @returns Icon string for task type
   */
  getTaskTypeIcon(taskType: string): string {
    const type = taskType.toLowerCase();
    if (type.includes('bug')) return '🐛';
    if (type.includes('feature')) return '✨';
    if (type.includes('improvement')) return '🔧';
    if (type.includes('story')) return '📖';
    return '📋';
  }

  /**
   * Get status icon for display
   * 
   * @param status Task status
   * @returns Icon string for status
   */
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'open': return '⭕';
      case 'in_progress': return '🔄';
      case 'blocked': return '🚫';
      case 'done': return '✅';
      case 'cancelled': return '❌';
      default: return '📌';
    }
  }
}