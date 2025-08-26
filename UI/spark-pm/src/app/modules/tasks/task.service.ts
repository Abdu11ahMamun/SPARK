import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/config/api.config';
import { TaskItem } from './task.model';

export interface Task extends TaskItem {}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiBaseUrl + '/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTasksBySprint(sprintId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-sprint/${sprintId}`);
  }
}
