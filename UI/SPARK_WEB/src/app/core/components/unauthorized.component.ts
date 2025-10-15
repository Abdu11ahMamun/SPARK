import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="unauthorized-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        
        <h1 class="unauthorized-title">Access Denied</h1>
        <p class="unauthorized-message">
          You don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div class="unauthorized-actions">
          <button 
            class="btn btn-primary"
            (click)="goBack()">
            Go Back
          </button>
          <button 
            class="btn btn-outline"
            (click)="goHome()">
            Go to Dashboard
          </button>
        </div>
        
        <div class="unauthorized-details" *ngIf="showDetails">
          <h3>Your Current Permissions:</h3>
          <div class="permissions-list">
            <span 
              class="permission-tag" 
              *ngFor="let permission of userPermissions">
              {{ permission }}
            </span>
          </div>
          <div class="roles-list" *ngIf="userRoles.length > 0">
            <h4>Your Roles:</h4>
            <span 
              class="role-tag" 
              *ngFor="let role of userRoles">
              {{ role.name }}
            </span>
          </div>
        </div>
        
        <button 
          class="btn btn-text details-toggle"
          (click)="toggleDetails()">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .unauthorized-icon {
      color: #ef4444;
      margin-bottom: 2rem;
    }

    .unauthorized-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .unauthorized-message {
      color: #6b7280;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .unauthorized-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-outline {
      background: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover {
      background: #3b82f6;
      color: white;
    }

    .btn-text {
      background: transparent;
      color: #6b7280;
      border: none;
      text-decoration: underline;
      padding: 0.5rem;
    }

    .btn-text:hover {
      color: #374151;
    }

    .unauthorized-details {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 8px;
      text-align: left;
    }

    .unauthorized-details h3,
    .unauthorized-details h4 {
      color: #374151;
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }

    .permissions-list,
    .roles-list {
      margin-bottom: 1rem;
    }

    .permission-tag,
    .role-tag {
      display: inline-block;
      background: #e5e7eb;
      color: #374151;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      margin: 0.25rem 0.25rem 0.25rem 0;
    }

    .role-tag {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .details-toggle {
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .unauthorized-container {
        padding: 1rem;
      }
      
      .unauthorized-content {
        padding: 2rem 1.5rem;
      }
      
      .unauthorized-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UnauthorizedComponent {
  showDetails = false;
  userPermissions: string[] = [];
  userRoles: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.userPermissions = this.authService.getUserPermissions();
    this.userRoles = this.authService.getUserRoles();
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}