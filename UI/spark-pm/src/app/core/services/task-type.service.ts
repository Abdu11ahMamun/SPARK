import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskTypeModel } from '../models/task-type.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskTypeService {
  private baseUrl = environment.apiUrl + '/api/job-types';
  constructor(private http: HttpClient) {}

  getAll(): Observable<TaskTypeModel[]> { return this.http.get<TaskTypeModel[]>(this.baseUrl); }
  get(id: number): Observable<TaskTypeModel> { return this.http.get<TaskTypeModel>(`${this.baseUrl}/${id}`); }
  create(payload: Partial<TaskTypeModel>): Observable<TaskTypeModel> { return this.http.post<TaskTypeModel>(this.baseUrl, payload); }
  update(id: number, payload: Partial<TaskTypeModel>): Observable<TaskTypeModel> { return this.http.put<TaskTypeModel>(`${this.baseUrl}/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
