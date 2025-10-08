import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleModel } from '../models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private baseUrl = environment.apiUrl + '/api/roles';
  constructor(private http: HttpClient) {}

  getAll(): Observable<RoleModel[]> { return this.http.get<RoleModel[]>(this.baseUrl); }
  get(id: number): Observable<RoleModel> { return this.http.get<RoleModel>(`${this.baseUrl}/${id}`); }
  create(payload: Partial<RoleModel>): Observable<RoleModel> { return this.http.post<RoleModel>(this.baseUrl, payload); }
  update(id: number, payload: Partial<RoleModel>): Observable<RoleModel> { return this.http.put<RoleModel>(`${this.baseUrl}/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
