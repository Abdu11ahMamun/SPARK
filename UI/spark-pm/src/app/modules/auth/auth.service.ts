import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginResponse { username: string; roles?: string[]; } // if backend later returns something

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'basicAuthToken';
  private userKey = 'authUser';
  private _username = signal<string | null>(null);
  isAuthenticated = computed(() => !!this._username());

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    if (stored && user) {
      this._username.set(user);
    }
  }

  login(username: string, password: string) {
    const basic = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ 'Authorization': `Basic ${basic}` });
    // Probe a lightweight endpoint (users or any permitted) - adjust if necessary
    return this.http.get<LoginResponse>(`${environment.apiUrl}/api/users/me`, { headers })
      .toPromise()
      .then(res => {
        localStorage.setItem(this.tokenKey, basic);
        localStorage.setItem(this.userKey, username);
        this._username.set(username);
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
    this._username.set(null);
    this.router.navigate(['/login']);
  }

  username() { return this._username(); }
}
