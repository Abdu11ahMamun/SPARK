import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class]="'notification-' + notification.type"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <!-- Success Icon -->
            <svg *ngIf="notification.type === 'success'" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <!-- Error Icon -->
            <svg *ngIf="notification.type === 'error'" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <!-- Info Icon -->
            <svg *ngIf="notification.type === 'info'" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <!-- Warning Icon -->
            <svg *ngIf="notification.type === 'warning'" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="notification-text">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
        </div>
        <button class="notification-close" (click)="close(notification.id)">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      animation: slideIn 0.3s ease-out;
    }

    .notification-success {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .notification-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    .notification-info {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .notification-warning {
      background-color: #fffbeb;
      border: 1px solid #fed7aa;
      color: #d97706;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      flex: 1;
    }

    .notification-icon {
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .notification-text {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .notification-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      margin-left: 0.5rem;
      border-radius: 0.25rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications.subscribe(
      (notifications: Notification[]) => this.notifications = notifications
    );
  }

  close(id: string) {
    this.notificationService.remove(id);
  }
}
