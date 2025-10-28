import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { AuthService } from './modules/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, SidebarComponent, NotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('spark-pm');
  sidebarCollapsed = signal(false);
  private currentUrl = signal('');

  showLayout = computed(() => {
    const url = this.currentUrl();
    // Hide sidebar & notifications on login or unauthorized pages, or when not authenticated
    const publicRoutes = ['/login', '/unauthorized'];
    const isPublicRoute = publicRoutes.some(route => url.startsWith(route));
    return this.auth.isAuthenticated() && !isPublicRoute;
  });

  constructor(private router: Router, private auth: AuthService) {
    this.currentUrl.set(this.router.url || '');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl.set(e.urlAfterRedirects || e.url || '');
      // Debug
      console.debug('[App] Navigated to', this.currentUrl(), 'showLayout=', this.showLayout());
    });
  }

  onSidebarToggled(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }
}
