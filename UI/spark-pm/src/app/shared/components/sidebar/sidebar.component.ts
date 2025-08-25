import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sidebarIcons } from './sidebar-icons';

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

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
    this.sidebarToggled.emit(this.isCollapsed());
  }
}
