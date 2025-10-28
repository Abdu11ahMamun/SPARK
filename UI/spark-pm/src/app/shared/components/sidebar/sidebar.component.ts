import { Component, signal, output, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sidebarIcons, SidebarIconKey } from './sidebar-icons';
import { MENU_ITEMS } from '../../config/menu.config';
import { MenuItem } from '../../models/menu-item.model';
import { AuthService } from '../../../modules/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Typed icon map - ensures template indexing safety
  icons: Record<SidebarIconKey, string> = sidebarIcons;
  isCollapsed = signal(false);
  sidebarToggled = output<boolean>();

  // Header (moved) controls
  darkMode = signal<boolean>(false);
  notificationsOpen = signal<boolean>(false);
  userMenuOpen = signal<boolean>(false);
  notifying = signal<boolean>(true);
  username = signal<string>('');
  fullName = signal<string>('John Doe'); // Default full name - can be updated from backend
  userEmail = signal<string>('user@example.com'); // Default email - can be updated from backend

  // Full menu definition
  private allMenuItems: MenuItem[] = MENU_ITEMS;

  // Filtered menu based on permissions
  visibleMenuItems = computed(() => {
    return this.allMenuItems.filter(item => {
      // Section markers always shown (permission gating handled by children)
      if (item.section) return true;
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
      // Admin wildcard '*' permission support
      const profile = this.auth.userProfile();
      const userPerms = profile?.permissions || [];
      if (userPerms.includes('*')) return true;
      const has = item.requireAll
        ? item.requiredPermissions.every(p => this.auth.hasPermission(p))
        : item.requiredPermissions.some(p => this.auth.hasPermission(p));
      return has;
    });
  });

  constructor(private auth: AuthService) {
  this.username.set(this.auth.username() || 'User');
    
    // Get enhanced user data from auth service
    const userProfile = this.auth.userProfile();
    if (userProfile) {
      this.fullName.set(this.auth.getUserFullName() || 'User');
      this.userEmail.set(this.auth.getUserEmail() || 'user@company.com');
    } else {
      // Fallback defaults
      this.fullName.set('User');
      this.userEmail.set('user@company.com');
    }
    
    const stored = localStorage.getItem('theme-dark');
    if (stored === '1') {
      this.darkMode.set(true);
      document.documentElement.classList.add('dark');
    }
    effect(() => {
      const isDark = this.darkMode();
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme-dark', isDark ? '1' : '0');
    });
  }

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
    this.sidebarToggled.emit(this.isCollapsed());
  }

  toggleDarkMode(ev: Event) { ev.preventDefault(); this.darkMode.set(!this.darkMode()); }
  toggleNotifications(ev: Event) { ev.preventDefault(); const open = !this.notificationsOpen(); this.notificationsOpen.set(open); if (open) this.notifying.set(false); }
  closeNotifications() { this.notificationsOpen.set(false); }
  toggleUserMenu(ev: Event) { 
    ev.preventDefault(); 
    const newState = !this.userMenuOpen();
    this.userMenuOpen.set(newState); 
  }
  closeUserMenu() { 
    this.userMenuOpen.set(false); 
  }
  logout() { 
    this.auth.logout(); 
  }
}
