import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest } from './team.model';
import { environment } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = environment.apiBaseUrl + '/teams';

  constructor(private http: HttpClient) {}

  // Team CRUD operations
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  createTeam(team: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  updateTeam(team: UpdateTeamRequest): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${team.id}`, team);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Team member operations
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${teamId}/members`);
  }

  getTeamMemberCount(teamId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${teamId}/members/count`);
  }

  addTeamMember(teamId: number, userId: number, role: string): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/${teamId}/members`, {
      userId,
      role
    });
  }

  updateTeamMemberRole(teamId: number, memberId: number, role: string): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.apiUrl}/${teamId}/members/${memberId}`, {
      role
    });
  }

  removeTeamMember(teamId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${memberId}`);
  }

  // Additional operations
  getTeamsByProject(projectId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getTeamsByLead(leadId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/lead/${leadId}`);
  }
}
