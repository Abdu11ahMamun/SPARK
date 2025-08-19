import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamMember } from '../teams/team.model';

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

export interface SprintUserCapacity {
  id?: number;
  sprintId: number;
  userId: number;
  userName: string;
  userCapacityPercentage: number;
  leaveDays: number;
  dailyWorkingHours: number;
  totalWorkingHours: number;
  availableWorkingHours: number;
  allocatedHours?: number;
  remainingHours?: number;
  utilizationPercentage?: number;
  isOverAllocated?: boolean;
  workingDays?: number;
  notes?: string;
  status: number;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

export interface SprintCapacitySummary {
  totalTeamMembers: number;
  activeMembers: number;
  membersOnLeave: number;
  totalCapacityHours: number;
  totalAllocatedHours: number;
  totalRemainingHours: number;
  averageUtilization: number;
  totalPotentialHours: number;
  totalLostHoursToLeave: number;
  totalLostHoursToCapacity: number;
  totalLeaveDays: number;
  teamEfficiency: number;
  overAllocatedMembers: number;
  underUtilizedMembers: number;
  hasCapacityRisks: boolean;
  sprintDurationDays: number;
  workingDays: number;
  holidays: number;
}

export interface SprintCreation {
  sprintName: string;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  detailsRemark?: string;
  createBy?: string;
  noOfHolidays: number;
  sprintDurationDays?: number;
  defaultDailyHours?: number;
  userCapacities: SprintUserCapacity[];
  capacitySummary?: SprintCapacitySummary;
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private baseUrl = 'http://localhost:8080/api/sprints';
  private capacityUrl = 'http://localhost:8080/api/sprint-capacity';

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

  // Capacity Management Methods
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.capacityUrl}/team/${teamId}/members`);
  }

  getSprintUserCapacities(sprintId: number): Observable<SprintUserCapacity[]> {
    return this.http.get<SprintUserCapacity[]>(`${this.capacityUrl}/sprint/${sprintId}/user-capacities`);
  }

  getSprintCapacitySummary(sprintId: number): Observable<SprintCapacitySummary> {
    return this.http.get<SprintCapacitySummary>(`${this.capacityUrl}/sprint/${sprintId}/summary`);
  }

  createSprintWithCapacity(sprintData: any): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.capacityUrl}/create-sprint`, sprintData);
  }

  addOrUpdateUserCapacity(sprintId: number, capacityData: SprintUserCapacity): Observable<SprintUserCapacity> {
    return this.http.post<SprintUserCapacity>(`${this.capacityUrl}/sprint/${sprintId}/user-capacity`, capacityData);
  }

  removeUserFromSprint(sprintId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.capacityUrl}/sprint/${sprintId}/user/${userId}`);
  }

  updateUserAllocation(sprintId: number, userId: number, allocatedHours: number): Observable<SprintUserCapacity> {
    return this.http.put<SprintUserCapacity>(`${this.capacityUrl}/sprint/${sprintId}/user/${userId}/allocation?allocatedHours=${allocatedHours}`, {});
  }
}
