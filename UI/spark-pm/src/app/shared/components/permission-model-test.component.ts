import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionTestService } from '../services/permission-test.service';
import { 
  Permission, 
  PermissionSummary, 
  PermissionCategory,
  PERMISSION_CODES,
  CATEGORY_DISPLAY_NAMES 
} from '../models';

/**
 * Test component to demonstrate TypeScript model usage in Angular
 */
@Component({
  selector: 'app-permission-model-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="permission-test-container">
      <h2>Permission Model Test Results</h2>
      
      <div class="test-section">
        <h3>Model Validation</h3>
        <div [class]="validationResult.success ? 'success' : 'error'">
          {{ validationResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h3>Sample Permissions ({{ permissions.length }})</h3>
        <ul>
          @for (permission of permissions; track permission.id) {
            <li>
              <strong>{{ permission.name }}</strong> - {{ permission.description }}
              <span class="category">[{{ getCategoryDisplayName(permission.category) }}]</span>
            </li>
          }
        </ul>
      </div>

      <div class="test-section">
        <h3>Permission Categories</h3>
        <div class="categories">
          @for (category of categories; track category) {
            <span class="category-badge">
              {{ getCategoryDisplayName(category) }}
            </span>
          }
        </div>
      </div>

      <div class="test-section">
        <h3>Permission Summaries</h3>
        <div class="summaries">
          @for (summary of permissionSummaries; track summary.name) {
            <div class="summary-card">
              <strong>{{ summary.name }}</strong>
              <p>{{ summary.description }}</p>
              <span class="status" [class.active]="summary.active">
                {{ summary.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          }
        </div>
      </div>

      <div class="test-section">
        <h3>Type Safety Demo</h3>
        <p>Valid permission code check:</p>
        <ul>
          <li>USER_VIEW: {{ isValidPermission('USER_VIEW') ? '✓' : '✗' }}</li>
          <li>INVALID_CODE: {{ isValidPermission('INVALID_CODE') ? '✓' : '✗' }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .permission-test-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .test-section h3 {
      margin-top: 0;
      color: #333;
    }

    .success {
      color: #28a745;
      font-weight: bold;
    }

    .error {
      color: #dc3545;
      font-weight: bold;
    }

    .category {
      font-size: 0.8em;
      color: #666;
      margin-left: 10px;
    }

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .category-badge {
      background: #f0f0f0;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 0.9em;
    }

    .summaries {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    .summary-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .summary-card strong {
      display: block;
      margin-bottom: 5px;
    }

    .summary-card p {
      margin: 5px 0;
      color: #666;
    }

    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      background: #6c757d;
      color: white;
    }

    .status.active {
      background: #28a745;
    }
  `]
})
export class PermissionModelTestComponent implements OnInit {
  permissions: Permission[] = [];
  permissionSummaries: PermissionSummary[] = [];
  categories: PermissionCategory[] = [];
  validationResult: { success: boolean; message: string } = { success: false, message: 'Not tested' };

  constructor(private permissionTestService: PermissionTestService) {}

  ngOnInit(): void {
    this.runTests();
  }

  private runTests(): void {
    // Run validation tests
    this.validationResult = this.permissionTestService.runValidationTests();

    // Load test data
    this.permissionTestService.getPermissions().subscribe(permissions => {
      this.permissions = permissions;
      this.permissionSummaries = this.permissionTestService.processPermissionData(permissions);
    });

    // Load categories
    this.categories = this.permissionTestService.getAllCategories();
  }

  getCategoryDisplayName(category?: PermissionCategory): string {
    if (!category) return 'Unknown';
    return CATEGORY_DISPLAY_NAMES[category] || category;
  }

  isValidPermission(code: string): boolean {
    return this.permissionTestService.validatePermissionCode(code);
  }
}