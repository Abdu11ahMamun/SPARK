import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface AdminNavItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  
  navItems: AdminNavItem[] = [
    {
      id: 'permissions',
      title: 'Permissions',
      icon: 'ri-shield-check-line',
      route: '/admin/permissions',
      description: 'Manage system permissions and role assignments',
      active: false
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: 'ri-user-settings-line',
      route: '/admin/roles',
      description: 'Configure roles and their capabilities',
      active: false
    },
    {
      id: 'users',
      title: 'Users',
      icon: 'ri-team-line',
      route: '/admin/users',
      description: 'Manage user accounts and role assignments',
      active: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set active nav item based on current route
    this.updateActiveNavItem(this.router.url);
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveNavItem(event.url);
    });
  }

  private updateActiveNavItem(url: string): void {
    this.navItems.forEach(item => {
      item.active = url.includes(item.id);
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}