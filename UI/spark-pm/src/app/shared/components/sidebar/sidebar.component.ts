import { Component, signal, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sidebarIcons } from './sidebar-icons';
import { AuthService } from '../../../modules/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  icons = sidebarIcons;
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

  constructor(private auth: AuthService) {
    this.username.set(this.auth.username() || 'User');
    // Set user data - these would typically come from the backend
    this.fullName.set('John Doe'); // TODO: Get from auth service or API
    this.userEmail.set('john.doe@company.com'); // TODO: Get from auth service or API
    
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
    console.log('Toggling user menu:', newState); // Debug log
    this.userMenuOpen.set(newState); 
  }
  closeUserMenu() { 
    console.log('Closing user menu'); // Debug log
    this.userMenuOpen.set(false); 
  }
  logout() { 
    console.log('Logout clicked'); // Debug log
    this.auth.logout(); 
  }
}
