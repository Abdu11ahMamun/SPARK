import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../tasks/task.service';
import { Task, TaskStatus, TaskPriority, TaskType, Sprint } from '../tasks/task.model';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { ProductService } from '../products/product.service';
import { Product } from '../products/product.model';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss']
})
export class BacklogComponent implements OnInit {
  backlogTasks: Task[] = [];
  filteredTasks: Task[] = [];
  users: User[] = [];
  products: Product[] = [];
  sprints: Sprint[] = [];
  selectedTasks: Set<number> = new Set();
  isLoading = false;
  
  // Filters
  searchTerm = '';
  selectedPriority = '';
  selectedProduct = '';
  selectedType = '';
  
  // Sprint assignment
  showSprintModal = false;
  selectedSprintForAssignment = '';

  // Enums for template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  TaskType = TaskType;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBacklogTasks();
    this.loadUsers();
    this.loadProducts();
    this.loadSprints();
  }

  loadBacklogTasks(): void {
    if (this.isLoading) return;
    
    console.log('Starting to load backlog tasks...');
    this.isLoading = true;
    
    this.taskService.getBacklogTasks().subscribe({
      next: (tasks) => {
        console.log('Backlog tasks received:', tasks);
        this.backlogTasks = tasks;
        this.updateTaskDisplayNames();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading backlog tasks:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.updateTaskDisplayNames();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.updateTaskDisplayNames();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadSprints(): void {
    this.taskService.getActiveSprints().subscribe({
      next: (sprints) => {
        this.sprints = sprints;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading sprints:', error);
      }
    });
  }

  private updateTaskDisplayNames(): void {
    this.backlogTasks.forEach(task => {
      // Add assignee name
      const assignee = this.users.find(u => u.id === task.assigneeId);
      task.assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}`.trim() : 'Unassigned';
      
      // Add reporter name
      const reporter = this.users.find(u => u.id === task.reporterId);
      task.reporterName = reporter ? `${reporter.firstName} ${reporter.lastName}`.trim() : 'Unknown';
      
      // Add product name
      const product = this.products.find(p => p.id === task.productId);
      task.productName = product?.name || 'No Product';
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.backlogTasks.filter(task => {
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPriority = !this.selectedPriority || task.priority === this.selectedPriority;
      const matchesProduct = !this.selectedProduct || task.productId?.toString() === this.selectedProduct;
      const matchesType = !this.selectedType || task.type === this.selectedType;
      
      return matchesSearch && matchesPriority && matchesProduct && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPriority = '';
    this.selectedProduct = '';
    this.selectedType = '';
    this.applyFilters();
  }

  // Task selection
  toggleTaskSelection(taskId: number): void {
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId);
    } else {
      this.selectedTasks.add(taskId);
    }
  }

  selectAllTasks(): void {
    this.filteredTasks.forEach(task => {
      if (task.id) {
        this.selectedTasks.add(task.id);
      }
    });
  }

  clearSelection(): void {
    this.selectedTasks.clear();
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.has(taskId);
  }

  // Sprint assignment
  showAssignToSprintModal(): void {
    if (this.selectedTasks.size === 0) {
      alert('Please select at least one task to assign to a sprint.');
      return;
    }
    this.showSprintModal = true;
  }

  closeSprintModal(): void {
    this.showSprintModal = false;
    this.selectedSprintForAssignment = '';
  }

  assignToSprint(): void {
    if (!this.selectedSprintForAssignment) {
      alert('Please select a sprint.');
      return;
    }

    const sprintId = parseInt(this.selectedSprintForAssignment);
    const taskPromises = Array.from(this.selectedTasks).map(taskId => 
      this.taskService.moveToSprint(taskId, sprintId)
    );

    Promise.all(taskPromises.map(p => p.toPromise())).then(() => {
      this.closeSprintModal();
      this.clearSelection();
      this.refreshBacklog();
      console.log('Tasks assigned to sprint successfully');
    }).catch(error => {
      console.error('Error assigning tasks to sprint:', error);
      alert('Error assigning tasks to sprint: ' + (error.error?.message || error.message));
    });
  }

  refreshBacklog(): void {
    if (this.isLoading) return;
    this.loadBacklogTasks();
  }

  // Utility methods
  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.CRITICAL: return 'priority-critical';
      default: return 'priority-medium';
    }
  }

  getTypeClass(type: TaskType): string {
    switch (type) {
      case TaskType.FEATURE: return 'type-feature';
      case TaskType.BUG: return 'type-bug';
      case TaskType.IMPROVEMENT: return 'type-improvement';
      case TaskType.DOCUMENTATION: return 'type-documentation';
      case TaskType.RESEARCH: return 'type-research';
      case TaskType.TESTING: return 'type-testing';
      default: return 'type-feature';
    }
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id || index;
  }
}
