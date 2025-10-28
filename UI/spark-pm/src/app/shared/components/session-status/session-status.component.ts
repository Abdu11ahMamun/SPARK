import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../modules/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-session-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showDebug()" class="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs font-mono z-50">
      <div class="text-green-400">Session Status</div>
      <div>Valid: {{ isAuthenticated() ? 'Yes' : 'No' }}</div>
      <div>Remaining: {{ sessionTimeRemaining() }}</div>
      <div>Inactivity: {{ inactivityTime() }}</div>
      <div *ngIf="userProfile()">User: {{ userProfile()?.username }}</div>
    </div>
  `,
  styles: []
})
export class SessionStatusComponent implements OnInit, OnDestroy {
  private updateInterval: any;
  
  showDebug = signal(!environment.production);
  isAuthenticated = computed(() => this.auth.isAuthenticated());
  userProfile = computed(() => this.auth.userProfile());
  
  sessionTimeRemaining = signal('--');
  inactivityTime = signal('--');

  constructor(private auth: AuthService) {}

  ngOnInit() {
    if (this.showDebug()) {
      this.updateInterval = setInterval(() => {
        this.updateSessionInfo();
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private updateSessionInfo() {
    const profile = this.userProfile();
    if (profile && profile.loginTime) {
      const now = Date.now();
      const sessionAge = now - profile.loginTime;
      const maxSession = 30 * 60 * 1000; // 30 minutes
      const remaining = Math.max(0, maxSession - sessionAge);
      
      this.sessionTimeRemaining.set(this.formatTime(remaining));
      
      if (profile.lastActivity) {
        const inactivity = now - profile.lastActivity;
        this.inactivityTime.set(this.formatTime(inactivity));
      }
    } else {
      this.sessionTimeRemaining.set('--');
      this.inactivityTime.set('--');
    }
  }

  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}