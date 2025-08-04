import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Inline interfaces to avoid module resolution issues
export interface Sprint {
  id?: number;
  sprintName: string;
  noOfHolidays: number;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  sprintArchive?: number;
  detailsRemark?: string;
  createBy?: string;
  createTime?: string;
  status: number;
  comments?: string;
  sprintOutcome?: string;
}

export interface SprintFormData {
  sprintName: string;
  noOfHolidays: number;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  detailsRemark?: string;
  status: number;
  comments?: string;
  sprintOutcome?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private baseUrl = 'http://localhost:8080/api/sprints';

  constructor(private http: HttpClient) {}

  getAllSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(this.baseUrl);
  }

  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.baseUrl}/${id}`);
  }

  createSprint(sprint: SprintFormData): Observable<Sprint> {
    return this.http.post<Sprint>(this.baseUrl, sprint);
  }

  updateSprint(id: number, sprint: SprintFormData): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.baseUrl}/${id}`, sprint);
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
