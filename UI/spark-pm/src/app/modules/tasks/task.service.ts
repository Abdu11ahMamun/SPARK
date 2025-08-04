import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskComment, Sprint, TaskStatus, TaskPriority, TaskType } from './task.model';
import { environment } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiBaseUrl + '/tasks';
  private sprintApiUrl = environment.apiBaseUrl + '/sprints';

  constructor(private http: HttpClient) {}

  // Task CRUD operations
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Task filtering and search
  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/status/${status}`);
  }

  getTasksByAssignee(assigneeId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/assignee/${assigneeId}`);
  }

  getTasksByProduct(productId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/product/${productId}`);
  }

  getTasksBySprint(sprintId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/sprint/${sprintId}`);
  }

  // Task status updates
  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/status`, { status });
  }

  // Task comments
  getTaskComments(taskId: number): Observable<TaskComment[]> {
    return this.http.get<TaskComment[]>(`${this.apiUrl}/${taskId}/comments`);
  }

  addTaskComment(taskId: number, comment: Partial<TaskComment>): Observable<TaskComment> {
    return this.http.post<TaskComment>(`${this.apiUrl}/${taskId}/comments`, comment);
  }

  // Sprint operations
  getSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(this.sprintApiUrl);
  }

  getActiveSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.sprintApiUrl}/active`);
  }

  getSprint(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.sprintApiUrl}/${id}`);
  }

  createSprint(sprint: Partial<Sprint>): Observable<Sprint> {
    return this.http.post<Sprint>(this.sprintApiUrl, sprint);
  }

  updateSprint(sprint: Sprint): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.sprintApiUrl}/${sprint.id}`, sprint);
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sprintApiUrl}/${id}`);
  }

  // Backlog operations
  getBacklogTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/backlog`);
  }

  moveToBacklog(taskId: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/move-to-backlog`, {});
  }

  moveToSprint(taskId: number, sprintId: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/move-to-sprint`, { sprintId });
  }

  // Task statistics
  getTaskStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getUserTaskStatistics(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/user/${userId}`);
  }

  getSprintStatistics(sprintId: number): Observable<any> {
    return this.http.get<any>(`${this.sprintApiUrl}/${sprintId}/statistics`);
  }
}
