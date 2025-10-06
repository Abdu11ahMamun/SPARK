import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface UserProfile {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  teamIds?: number[];
  teams?: { id: number; name: string; }[];
}

interface LoginResponse { 
  username: string; 
  firstName?: string;
  lastName?: string;
  email: string;
  roles?: string[];
  teamIds?: number[];
  teams?: { id: number; name: string; }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'basicAuthToken';
  private userKey = 'authUser';
  private profileKey = 'userProfile';
  
  private _username = signal<string | null>(null);
  private _userProfile = signal<UserProfile | null>(null);
  
  isAuthenticated = computed(() => !!this._username());
  userProfile = computed(() => this._userProfile());

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    const profile = localStorage.getItem(this.profileKey);
    
    if (stored && user) {
      this._username.set(user);
      if (profile) {
        try {
          this._userProfile.set(JSON.parse(profile));
        } catch (e) {
          console.warn('Invalid profile data in localStorage');
        }
      }
    }
  }

  login(username: string, password: string) {
    const basic = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ 'Authorization': `Basic ${basic}` });
    
    return this.http.get<LoginResponse>(`${environment.apiUrl}/api/users/me`, { headers })
      .toPromise()
      .then(res => {
        if (!res) throw new Error('No response received');
        
        // Store basic auth data
        localStorage.setItem(this.tokenKey, basic);
        localStorage.setItem(this.userKey, username);
        this._username.set(username);
        
        // Create and store user profile
        const profile: UserProfile = {
          username: res.username || username,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email || `${username}@company.com`, // fallback email
          roles: res.roles || ['USER'],
          teamIds: res.teamIds || [],
          teams: res.teams || []
        };
        
        localStorage.setItem(this.profileKey, JSON.stringify(profile));
        this._userProfile.set(profile);
        
        return true;
      })
      .catch(err => {
        throw err;
      });
  }

  getAuthHeader(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token ? `Basic ${token}` : null;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.profileKey);
    this._username.set(null);
    this._userProfile.set(null);
    this.router.navigate(['/login']);
  }

  // Getter methods for easy access
  username() { return this._username(); }
  
  getUserFullName(): string {
    const profile = this._userProfile();
    if (!profile) return '';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username;
  }
  
  getUserEmail(): string {
    return this._userProfile()?.email || '';
  }
  
  getUserRoles(): string[] {
    return this._userProfile()?.roles || [];
  }
  
  getUserTeams(): { id: number; name: string; }[] {
    // Ensure we always expose `name`
    return (this._userProfile()?.teams || []).map(t => ({ id: t.id, name: (t as any).name || (t as any).teamName }));
  }
  
  getUserTeamIds(): number[] {
    return this._userProfile()?.teamIds || [];
  }
  
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
  
  isInTeam(teamId: number): boolean {
    return this.getUserTeamIds().includes(teamId);
  }

  /**
   * Refresh teams for current logged-in user by calling backend teams endpoint.
   * Assumes we have a user id stored inside profile (extend if missing).
   */
  async refreshUserTeams(userId?: number) {
    const profile = this._userProfile();
    if (!profile) return;

    // If profile doesn't have id we cannot fetch teams yet
    // (Backend /api/users/me currently returns only username & role).
    // Optionally could add new endpoint to return id.
    const effectiveUserId = userId || (profile as any).id;
    if (!effectiveUserId) {
      return; // Cannot resolve id; skip silently
    }

    try {
      const teams = await this.http.get<any[]>(`${environment.apiUrl}/api/users/${effectiveUserId}/teams`).toPromise();
      if (teams) {
        // Normalize property name to `name` used in UI components
        const normalized = teams.map(t => ({
          id: t.id,
            // backend returns teamName
          name: t.teamName || t.name,
          teamName: t.teamName || t.name,
          description: t.description,
          status: t.status,
          pOwner: t.pOwner,
          sMaster: t.sMaster
        }));
        const updated = { ...profile, teams: normalized } as any;
        this._userProfile.set(updated);
        localStorage.setItem(this.profileKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to refresh user teams', e);
    }
  }
}
