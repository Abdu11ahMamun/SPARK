import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority, TaskType, Sprint } from './task.model';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { ProductService } from '../products/product.service';
import { Product, ProductModule } from '../products/product.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  users: User[] = [];
  products: Product[] = [];
  modules: ProductModule[] = [];
  sprints: Sprint[] = [];
  selectedTask: Task | null = null;
  isAdd = false;
  isEdit = false;
  isLoading = false;
  showDeleteConfirm = false;
  taskToDelete: Task | null = null;
  showTaskDetails = false;
  
  // Filters
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedAssignee = '';
  selectedModule = '';
  selectedSprint = '';
  
  // View mode
  viewMode: 'list' | 'board' = 'list';
  
  // Form data
  taskForm: CreateTaskRequest = {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    type: TaskType.FEATURE,
    assigneeId: undefined,
    reporterId: undefined,
    productId: undefined,
    moduleId: undefined,
    sprintId: undefined,
    estimatedHours: undefined,
    dueDate: ''
  };

  // Enums for template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  TaskType = TaskType;

  // Board columns for Kanban view
  boardColumns = [
    { status: TaskStatus.TODO, title: 'To Do', class: 'todo' },
    { status: TaskStatus.IN_PROGRESS, title: 'In Progress', class: 'in-progress' },
    { status: TaskStatus.IN_REVIEW, title: 'In Review', class: 'in-review' },
    { status: TaskStatus.TESTING, title: 'Testing', class: 'testing' },
    { status: TaskStatus.DONE, title: 'Done', class: 'done' }
  ];

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
    this.loadModules(); // Load modules instead of products
    this.loadSprints();
  }

  loadTasks(): void {
    if (this.isLoading) return;
    
    console.log('Starting to load tasks...');
    this.isLoading = true;
    
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tasks received:', tasks);
        this.tasks = tasks;
        this.updateTaskDisplayNames();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
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

  loadModules(): void {
    this.productService.getAllModules().subscribe({
      next: (modules: ProductModule[]) => {
        this.modules = modules;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadSprints(): void {
    this.taskService.getSprints().subscribe({
      next: (sprints) => {
        this.sprints = sprints;
        this.updateTaskDisplayNames();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading sprints:', error);
      }
    });
  }

  private updateTaskDisplayNames(): void {
    this.tasks.forEach(task => {
      // Add assignee name
      const assignee = this.users.find(u => u.id === task.assigneeId);
      task.assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}`.trim() : 'Unassigned';
      
      // Add reporter name
      const reporter = this.users.find(u => u.id === task.reporterId);
      task.reporterName = reporter ? `${reporter.firstName} ${reporter.lastName}`.trim() : 'Unknown';
      
      // Add module name
      const module = this.modules.find(m => m.id === task.moduleId);
      task.moduleName = module?.name || 'No Module';
      
      // Add sprint name
      const sprint = this.sprints.find(s => s.id === task.sprintId);
      task.sprintName = sprint?.name || 'No Sprint';
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || task.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || task.priority === this.selectedPriority;
      const matchesAssignee = !this.selectedAssignee || task.assigneeId?.toString() === this.selectedAssignee;
      const matchesModule = !this.selectedModule || task.moduleId?.toString() === this.selectedModule;
      const matchesSprint = !this.selectedSprint || task.sprintId?.toString() === this.selectedSprint;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesModule && matchesSprint;
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
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedAssignee = '';
    this.selectedModule = '';
    this.selectedSprint = '';
    this.applyFilters();
  }

  addTask(): void {
    this.isAdd = true;
    this.isEdit = false;
    this.selectedTask = null;
    this.resetForm();
  }

  editTask(task: Task): void {
    this.isEdit = true;
    this.isAdd = false;
    this.selectedTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      type: task.type,
      assigneeId: task.assigneeId,
      reporterId: task.reporterId,
      productId: task.productId,
      moduleId: task.moduleId,
      sprintId: task.sprintId,
      estimatedHours: task.estimatedHours,
      dueDate: task.dueDate || ''
    };
  }

  saveTask(): void {
    if (this.isAdd) {
      this.createTask();
    } else if (this.isEdit) {
      this.updateTask();
    }
  }

  createTask(): void {
    this.taskService.createTask(this.taskForm).subscribe({
      next: (task) => {
        this.cancel();
        this.refreshTasks();
        console.log('Task created successfully');
      },
      error: (error: any) => {
        console.error('Error creating task:', error);
        alert('Error creating task: ' + (error.error?.message || error.message));
      }
    });
  }

  updateTask(): void {
    if (!this.selectedTask?.id) return;
    
    const updateRequest: UpdateTaskRequest = {
      id: this.selectedTask.id,
      ...this.taskForm
    };
    
    this.taskService.updateTask(updateRequest).subscribe({
      next: (task) => {
        this.cancel();
        this.refreshTasks();
        console.log('Task updated successfully');
      },
      error: (error: any) => {
        console.error('Error updating task:', error);
        alert('Error updating task: ' + (error.error?.message || error.message));
      }
    });
  }

  confirmDeleteTask(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteConfirm = true;
  }

  deleteTask(): void {
    if (!this.taskToDelete?.id) return;
    
    this.taskService.deleteTask(this.taskToDelete.id).subscribe({
      next: () => {
        this.cancelDelete();
        this.refreshTasks();
        console.log('Task deleted successfully');
      },
      error: (error: any) => {
        console.error('Error deleting task:', error);
        alert('Error deleting task: ' + (error.error?.message || error.message));
      }
    });
  }

  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.selectedTask = null;
    this.resetForm();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.taskToDelete = null;
  }

  resetForm(): void {
    this.taskForm = {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      type: TaskType.FEATURE,
      assigneeId: undefined,
      reporterId: undefined,
      productId: undefined,
      moduleId: undefined,
      sprintId: undefined,
      estimatedHours: undefined,
      dueDate: ''
    };
  }

  refreshTasks(): void {
    if (this.isLoading) return;
    this.loadTasks();
  }

  viewTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetails = true;
  }

  closeTaskDetails(): void {
    this.showTaskDetails = false;
    this.selectedTask = null;
  }

  // Board view methods
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'board' : 'list';
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  onTaskDrop(event: any, targetStatus: TaskStatus): void {
    // Handle drag and drop for Kanban board
    const taskId = event.dataTransfer.getData('text/plain');
    const task = this.tasks.find(t => t.id?.toString() === taskId);
    
    if (task && task.status !== targetStatus) {
      this.updateTaskStatus(task, targetStatus);
    }
  }

  onTaskDragStart(event: any, task: Task): void {
    event.dataTransfer.setData('text/plain', task.id?.toString() || '');
  }

  updateTaskStatus(task: Task, newStatus: TaskStatus): void {
    if (!task.id) return;
    
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], status: newStatus };
          this.updateTaskDisplayNames();
          this.applyFilters();
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error updating task status:', error);
        alert('Error updating task status: ' + (error.error?.message || error.message));
      }
    });
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

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'status-todo';
      case TaskStatus.IN_PROGRESS: return 'status-in-progress';
      case TaskStatus.IN_REVIEW: return 'status-in-review';
      case TaskStatus.TESTING: return 'status-testing';
      case TaskStatus.DONE: return 'status-done';
      case TaskStatus.BLOCKED: return 'status-blocked';
      default: return 'status-todo';
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
