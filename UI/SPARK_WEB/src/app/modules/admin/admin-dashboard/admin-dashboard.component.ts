import { Component } from '@angular/core';

/**
 * Placeholder component for Admin Dashboard functionality
 * This will be implemented in a future step
 */
@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <i class="fas fa-chart-pie"></i>
        </div>
        <h2>Admin Dashboard</h2>
        <p>Admin dashboard with analytics and metrics will be implemented in a future step.</p>
        <div class="placeholder-features">
          <ul>
            <li><i class="fas fa-check"></i> System overview and metrics</li>
            <li><i class="fas fa-check"></i> User activity analytics</li>
            <li><i class="fas fa-check"></i> Permission usage statistics</li>
            <li><i class="fas fa-check"></i> Security audit logs</li>
            <li><i class="fas fa-check"></i> Performance monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-placeholder {
      padding: 3rem;
      text-align: center;
      background: white;
      border-radius: 12px;
      margin: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .placeholder-content {
      max-width: 500px;
      margin: 0 auto;
    }

    .placeholder-icon {
      font-size: 4rem;
      color: #9b59b6;
      margin-bottom: 1.5rem;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    p {
      color: #6c757d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .placeholder-features ul {
      list-style: none;
      padding: 0;
      text-align: left;
    }

    .placeholder-features li {
      padding: 0.5rem 0;
      color: #495057;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .placeholder-features li i {
      color: #28a745;
      font-size: 0.875rem;
    }
  `]
})
export class AdminDashboardComponent {

}