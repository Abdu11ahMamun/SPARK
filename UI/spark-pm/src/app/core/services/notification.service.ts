import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications = this.notifications$.asObservable();

  show(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, newNotification]);

    if (newNotification.autoClose) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }
  }

  success(title: string, message: string, autoClose: boolean = true): void {
    this.show({ type: 'success', title, message, autoClose });
  }

  error(title: string, message: string, autoClose: boolean = true): void {
    this.show({ type: 'error', title, message, autoClose });
  }

  info(title: string, message: string, autoClose: boolean = true): void {
    this.show({ type: 'info', title, message, autoClose });
  }

  warning(title: string, message: string, autoClose: boolean = true): void {
    this.show({ type: 'warning', title, message, autoClose });
  }

  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
