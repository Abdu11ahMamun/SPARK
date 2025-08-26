import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../core/config/api.config';
import { 
  Sprint, 
  SprintFormData, 
  SprintCreation, 
  SprintUserCapacity, 
  SprintCapacitySummary, 
  TeamMember 
} from './sprints.model';

@Injectable({ providedIn: 'root' })
export class SprintService {
  // Primary (CORS-enabled) endpoint and a fallback
  private apiUrl = environment.apiBaseUrl + '/sprints';
  private fallbackUrl = environment.apiBaseUrl + '/sprint-infos';
  private capacityApiUrl = environment.apiBaseUrl + '/sprint-capacity';

  constructor(private http: HttpClient) {}

  // Original Sprint CRUD operations
  getAllSprints(): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(this.apiUrl).pipe(
      catchError(() => this.http.get<Sprint[]>(this.fallbackUrl))
    );
  }

  getSprint(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.apiUrl}/${id}`);
  }

  createSprint(payload: SprintFormData): Observable<Sprint> {
    return this.http.post<Sprint>(this.apiUrl, payload);
  }

  updateSprint(id: number, payload: SprintFormData): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.apiUrl}/${id}`, payload);
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Enhanced Sprint Capacity Management operations

  /**
   * Create sprint with capacity planning
   */
  createSprintWithCapacity(sprintData: SprintCreation): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.capacityApiUrl}/create-sprint`, sprintData);
  }

  /**
   * Add or update user capacity for a sprint
   */
  addOrUpdateUserCapacity(sprintId: number, capacity: SprintUserCapacity): Observable<SprintUserCapacity> {
    return this.http.post<SprintUserCapacity>(`${this.capacityApiUrl}/sprint/${sprintId}/user-capacity`, capacity);
  }

  /**
   * Get all user capacities for a sprint
   */
  getSprintUserCapacities(sprintId: number): Observable<SprintUserCapacity[]> {
    return this.http.get<SprintUserCapacity[]>(`${this.capacityApiUrl}/sprint/${sprintId}/user-capacities`);
  }

  /**
   * Get sprint capacity summary
   */
  getSprintCapacitySummary(sprintId: number): Observable<SprintCapacitySummary> {
    return this.http.get<SprintCapacitySummary>(`${this.capacityApiUrl}/sprint/${sprintId}/summary`);
  }

  /**
   * Remove user from sprint
   */
  removeUserFromSprint(sprintId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.capacityApiUrl}/sprint/${sprintId}/user/${userId}`);
  }

  /**
   * Update user allocation hours
   */
  updateUserAllocation(sprintId: number, userId: number, allocatedHours: number): Observable<SprintUserCapacity> {
    return this.http.put<SprintUserCapacity>(
      `${this.capacityApiUrl}/sprint/${sprintId}/user/${userId}/allocation`,
      null,
      { params: { allocatedHours: allocatedHours.toString() } }
    );
  }

  /**
   * Get team members for sprint planning
   */
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${environment.apiBaseUrl}/teams/${teamId}/members`);
  }

  /**
   * Calculate sprint duration in days
   */
  calculateSprintDuration(fromDate: string, toDate: string): number {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
  }

  /**
   * Calculate working hours for a user
   */
  calculateUserWorkingHours(
    sprintDurationDays: number, 
    leaveDays: number, 
    dailyHours: number, 
    capacityPercentage: number
  ): { totalHours: number, availableHours: number, workingDays: number } {
    const workingDays = Math.max(0, sprintDurationDays - leaveDays);
    const totalHours = sprintDurationDays * dailyHours;
    const availableHours = workingDays * dailyHours * (capacityPercentage / 100);
    
    return {
      totalHours,
      availableHours,
      workingDays
    };
  }

  /**
   * Validate sprint capacity data
   */
  validateSprintCapacity(sprintData: SprintCreation): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];

    // Basic validations
    if (!sprintData.sprintName || sprintData.sprintName.trim().length === 0) {
      errors.push('Sprint name is required');
    }

    if (!sprintData.fromDate || !sprintData.toDate) {
      errors.push('Sprint start and end dates are required');
    } else {
      const fromDate = new Date(sprintData.fromDate);
      const toDate = new Date(sprintData.toDate);
      
      if (fromDate >= toDate) {
        errors.push('End date must be after start date');
      }
    }

    if (!sprintData.tramId || sprintData.tramId <= 0) {
      errors.push('Team selection is required');
    }

    // Capacity validations
    if (sprintData.userCapacities && sprintData.userCapacities.length > 0) {
      sprintData.userCapacities.forEach((capacity, index) => {
        if (!capacity.userName || capacity.userName.trim().length === 0) {
          errors.push(`User name is required for team member ${index + 1}`);
        }

        if (capacity.userCapacityPercentage < 0 || capacity.userCapacityPercentage > 100) {
          errors.push(`Capacity percentage must be between 0 and 100 for ${capacity.userName}`);
        }

        if (capacity.leaveDays < 0) {
          errors.push(`Leave days cannot be negative for ${capacity.userName}`);
        }

        if (capacity.dailyWorkingHours <= 0 || capacity.dailyWorkingHours > 24) {
          errors.push(`Daily working hours must be between 0 and 24 for ${capacity.userName}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
