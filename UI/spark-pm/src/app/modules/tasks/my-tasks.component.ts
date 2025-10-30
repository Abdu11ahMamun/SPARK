import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { TaskItem } from './task.model';
import { environment } from '../../../environments/environment';

interface KanbanColumn {
  id: string;
  title: string;
  status: TaskItem['status'];
  color: string;
  tasks: TaskItem[];
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit {
  
  // Reactive signals
  private _tasks = signal<TaskItem[]>([]);
  private _isLoading = signal(false);
  
  // Computed properties
  tasks = computed(() => this._tasks());
  isLoading = computed(() => this._isLoading());
  
  // Kanban columns configuration
  columns: KanbanColumn[] = [
    {
      id: 'open',
      title: 'To Do',
      status: 'OPEN',
      color: '#3b82f6',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'IN_PROGRESS',
      color: '#f59e0b',
      tasks: []
    },
    {
      id: 'blocked',
      title: 'Blocked',
      status: 'BLOCKED',
      color: '#ef4444',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      status: 'DONE',
      color: '#10b981',
      tasks: []
    }
  ];

  // User info
  userInfo = computed(() => ({
    username: this.authService.username(),
    fullName: this.authService.getUserFullName(),
    email: this.authService.getUserEmail(),
    teams: this.authService.getUserTeams(),
    roles: this.authService.getUserRoles()
  }));

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  private async initializeData() {
    await this.loadMyTasks();
    // Attempt to refresh user teams if teams array empty
    if (this.userInfo().teams.length === 0) {
      // Try to resolve user id by calling /api/users and matching username (temporary workaround)
      try {
  const allUsers = (await this.http.get<any[]>(`${environment.apiUrl}/api/users`).toPromise()) || [];
  const me = (allUsers as any[]).find(u => u.username?.toLowerCase() === this.userInfo().username?.toLowerCase());
        if (me?.id) {
          await (this.authService as any).refreshUserTeams(me.id);
        }
      } catch (e) {
        console.warn('Could not resolve user id for team refresh', e);
      }
    }
  }

  private async loadMyTasks() {
    this._isLoading.set(true);
    
    try {
      const userProfile = this.authService.userProfile();
      if (!userProfile) {
        console.error('User profile not available');
        return;
      }

      // Use new session-based endpoint
      await this.fetchMyTasksFromSession();
      
    } catch (error) {
      console.error('Error loading my tasks:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  private async fetchMyTasksFromSession() {
    try {
      console.log('Fetching tasks from:', `${environment.apiUrl}/api/my-tasks`);
      
      // Use new session-based endpoint that derives user from authentication
      const response = await this.http.get<any>(`${environment.apiUrl}/api/my-tasks`).toPromise();
      
      console.log('Raw API response:', response);
      
      // Handle both direct array and ApiResponse wrapper
      let myTasks: TaskItem[] = [];
      
      if (Array.isArray(response)) {
        myTasks = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        myTasks = response.data;
      } else if (response && Array.isArray(response.tasks)) {
        myTasks = response.tasks;
      } else {
        console.warn('Unexpected response format:', response);
        return;
      }
      
      console.log('Processed tasks:', myTasks);
      console.log('Number of tasks:', myTasks.length);
      
      if (myTasks && myTasks.length >= 0) {
        // Transform API data to match TaskItem interface
        const transformedTasks: TaskItem[] = myTasks.map((task: any) => ({
          id: task.id,
          mitsNo: task.mitsNo || `TASK-${task.id}`,
          taskType: task.taskType || task.type || 'Task',
          productId: task.productId,
          productModuleId: task.productModuleId,
          title: task.title || 'Untitled Task',
          description: task.description,
          assigneeUserId: task.assigneeUserId || task.assigneeId,
          status: task.status || 'OPEN',
          priority: task.priority || 'MEDIUM',
          deadline: task.deadline || task.dueDate,
          points: task.points || task.storyPoints,
          createdAt: task.createdAt || task.created,
          updatedAt: task.updatedAt || task.updated
        }));
        
        console.log('Transformed tasks:', transformedTasks);
        
        this._tasks.set(transformedTasks);
        this.updateKanbanColumns();
        console.log('Tasks set successfully, columns updated');
      } else {
        console.log('No tasks found');
        this._tasks.set([]);
        this.updateKanbanColumns();
      }
    } catch (error) {
      console.error('Error fetching my tasks from session:', error);
      // Fallback: load all tasks and filter client-side
      await this.fallbackLoadTasks();
    }
  }

  private async fallbackLoadTasks() {
    try {
      const allTasks = await this.taskService.getTasks().toPromise();
      const username = this.authService.username();
      
      if (allTasks && username) {
        // Filter tasks by username if assignee matches (fallback approach)
        const myTasks = allTasks.filter(task => {
          // This assumes you have assignee info available
          // Adjust the filtering logic based on your data structure
          return task.assigneeUserId || false; // You may need to adjust this
        });
        
        this._tasks.set(myTasks);
        this.updateKanbanColumns();
      }
    } catch (error) {
      console.error('Fallback task loading failed:', error);
    }
  }

  private updateKanbanColumns() {
    const tasks = this._tasks();
    console.log('Updating kanban columns with tasks:', tasks);
    console.log('Total tasks count:', tasks.length);
    
    this.columns.forEach(column => {
      const filteredTasks = tasks.filter(task => task.status === column.status);
      column.tasks = filteredTasks;
      console.log(`Column ${column.title} (${column.status}):`, filteredTasks.length, 'tasks');
    });
    
    console.log('Updated columns:', this.columns);
  }

  // Drag and drop handlers
  onDragStart(event: DragEvent, task: TaskItem) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        taskId: task.id,
        fromStatus: task.status
      }));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  async onDrop(event: DragEvent, targetColumn: KanbanColumn) {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer!.getData('text/plain'));
      const { taskId, fromStatus } = data;
      
      if (fromStatus === targetColumn.status) {
        return; // No change needed
      }

      await this.updateTaskStatus(taskId, targetColumn.status);
      
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }

  private async updateTaskStatus(taskId: number, newStatus: TaskItem['status']) {
    try {
      // Use new PATCH endpoint for status updates
      await this.http.patch(`${environment.apiUrl}/api/my-tasks/${taskId}/status`, { status: newStatus }).toPromise();
      
      // Update local state
      const currentTasks = this._tasks();
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      this._tasks.set(updatedTasks);
      this.updateKanbanColumns();
      
    } catch (error) {
      console.error('Error updating task status:', error);
      // You could show a toast notification here
    }
  }

  // Task priority helpers
  getPriorityClass(priority: string | null | undefined): string {
    if (!priority || typeof priority !== 'string') return 'priority-medium';
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getPriorityIcon(priority: string | null | undefined): string {
    if (!priority || typeof priority !== 'string') return '🟡';
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return '🔥';
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '🟡';
    }
  }

  // Task type helpers
  getTaskTypeIcon(taskType: string | null | undefined): string {
    if (!taskType || typeof taskType !== 'string') return '📋';
    const type = taskType.toLowerCase();
    if (type.includes('bug')) return '🐛';
    if (type.includes('feature')) return '✨';
    if (type.includes('improvement')) return '🔧';
    if (type.includes('story')) return '📖';
    return '📋';
  }

  getTaskTypeClass(taskType: string | null | undefined): string {
    if (!taskType || typeof taskType !== 'string') return 'task-type-default';
    const type = taskType.toLowerCase();
    if (type.includes('bug')) return 'task-type-bug';
    if (type.includes('feature')) return 'task-type-feature';
    if (type.includes('improvement')) return 'task-type-improvement';
    if (type.includes('story')) return 'task-type-story';
    return 'task-type-default';
  }

  // Utility methods
  getDaysUntilDeadline(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(deadline: string): boolean {
    return this.getDaysUntilDeadline(deadline) < 0;
  }

  formatDeadline(deadline: string): string {
    const days = this.getDaysUntilDeadline(deadline);
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days > 0) return `Due in ${days} days`;
    return `${Math.abs(days)} days overdue`;
  }

  // Refresh data
  async refresh() {
    await this.loadMyTasks();
  }
}