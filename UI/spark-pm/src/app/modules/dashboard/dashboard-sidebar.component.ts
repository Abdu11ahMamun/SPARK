import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { sidebarIcons } from './sidebar-icons';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent {
  icons = sidebarIcons;
}
