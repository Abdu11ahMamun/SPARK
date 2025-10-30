import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService, Sprint } from './sprint.service';
import { TaskService } from '../tasks/task.service';
import { SprintAddTasksDialogComponent } from './sprint-add-tasks-dialog.component';
import { User } from './user.model';
import { Product } from '../products/product.model';
import { forkJoin, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { delay } from 'rxjs/operators';
import { PointCalculatorComponent } from '../../shared/point-calculator/point-calculator.component';
// NOTE: Importing standalone TaskCommentsDialogComponent (sibling folder '../shared').
// If NG1010 persists, ensure no tsconfig path alias conflicts and that this file isn't duplicated.
import { TaskCommentsDialogComponent } from '../shared/task-comments-dialog/task-comments-dialog.component';
import Chart from 'chart.js/auto';

// Interface for user progress based on points
interface UserProgress {
  userId: number;
  userName: string;
  userEmail?: string;
  avatar?: string;
  assignedPoints: number;
  accomplishedPoints: number;
  inProgressPoints: number;
  remainingPoints: number;
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  efficiency: 'High' | 'Medium' | 'Low';
}

// Additional interfaces for component use
interface ProductModule {
  id: number;
  name: string;
  productId: number;
}

interface SprintCapacity {
  id: number;
  userId: number;
  sprintId: number;
  availableHours: number;
  userName?: string;
}

@Component({
  selector: 'app-sprint-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SprintAddTasksDialogComponent, PointCalculatorComponent, TaskCommentsDialogComponent],
  templateUrl: './sprint-details.component.html',
  styleUrls: ['./sprint-details.component.scss']
})
export class SprintDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  sprintId!: number;
  isLoading = true;
  isError = false;
  hasNoData = false; // Track when sprint has no tasks
  activeTab = 'overview'; // overview, tasks, kanban, burndown
  
  private routeSubscription: Subscription = new Subscription();

  // Placeholders to be wired to services later
  sprint: Sprint | null = null;
  tasks: any[] = [];
  users: User[] = [];
  products: Product[] = [];
  productModules: ProductModule[] = [];
  sprintCapacities: SprintCapacity[] = [];
  userProgress: UserProgress[] = [];
  // Cached job types/modules (will lazily load when first needed)
  jobTypes: { id: number; type: string }[] = [];

  // Inline edit state
  editingTaskId: number | null = null;
  editBuffer: { status?: string; assigneeId?: number; points?: number; taskType?: string | number; productModuleId?: number; deadline?: string | null } = {};
  // Inline calculator state
  showInlineCalcFor: number | null = null;
  inlineCalcReset = 0;
  originalPointsForCalc = 0;
  // Center modal now; keep fields for potential future revert
  calcPosition: { top: number; left: number } | null = null; // unused in modal mode
  private lastFocusedInput?: HTMLElement;
  private suppressCloseUntil = 0;
  // Prevent immediate re-open after closing (Apply / Cancel) while input still focused
  private ignoreFocusUntil = 0;
  inlineSaving: number | null = null; // task id currently saving inline
  // Comments dialog state
  showCommentsForTaskId: number | null = null;
  
  kanbanColumns: { key: string; title: string; tasks: any[] }[] = [
    { key: 'TODO', title: 'To-Do', tasks: [] },
    { key: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
    { key: 'REVIEW', title: 'Review', tasks: [] },
    { key: 'DONE', title: 'Done', tasks: [] },
  ];
  burndown: { labels: string[]; actual: number[]; ideal: number[] } | null = null;
  private chart?: Chart;

  // Task filters
  taskFilter = {
    title: '',
    status: '',
    assignee: ''
  };

  // Add tasks dialog properties
  showAddTasksDialog = false;

  @ViewChild('burndownCanvas') burndownCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sprintService: SprintService,
    private taskService: TaskService,
  private cdr: ChangeDetectorRef,
  private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes to handle direct navigation
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      console.log('ngOnInit - Route id param:', params.get('id'), 'Parsed id:', id);
      if (!isNaN(id)) {
        this.sprintId = id;
        console.log('SprintId set to:', this.sprintId);
        // Load sprint and tasks whenever the route parameter changes
        this.fetchAll();
      } else {
        console.error('Invalid sprint ID');
        this.isLoading = false;
        this.isError = true;
      }
    });
  }

  back(): void {
    this.router.navigate(['/sprints']);
  }

  // Helpers used by template (avoid inline lambdas in bindings)
  taskCount(status: string): number {
  if (!Array.isArray(this.tasks)) return 0;
  const norm = (s: any) => String(s || '').toUpperCase().replace(/\s+/g, '_');
  const want = norm(status);
  return this.tasks.filter(t => t && norm(t.status) === want).length;
  }

  burndownRemaining(): number {
    if (!this.burndown || !Array.isArray(this.burndown.actual) || this.burndown.actual.length === 0) return 0;
    const last = this.burndown.actual[this.burndown.actual.length - 1];
    return typeof last === 'number' ? last : 0;
  }

  fetchAll(): void {
    console.log('fetchAll called for sprintId:', this.sprintId);
    
    // Ensure we have a valid sprint ID
    if (!this.sprintId) {
      console.error('No valid sprint ID available');
      this.isLoading = false;
      this.isError = true;
      return;
    }
    
    this.isLoading = true;
    this.isError = false;
    this.hasNoData = false;
    
    // Add a small delay to ensure component is fully initialized
    forkJoin({
      sprint: this.sprintService.getSprintById(this.sprintId),
      tasks: this.taskService.getTasksBySprint(this.sprintId),
      users: this.http.get<User[]>(`${environment.apiUrl}/api/users`),
      products: this.http.get<Product[]>(`${environment.apiUrl}/api/products`).pipe(delay(0)),
      productModules: this.http.get<ProductModule[]>(`${environment.apiUrl}/api/product-modules`).pipe(delay(0)),
      jobTypes: this.http.get<{id:number; type:string}[]>(`${environment.apiUrl}/api/job-types`).pipe(delay(0))
    }).pipe(
      delay(100) // Small delay to ensure component is ready
    ).subscribe({
      next: ({ sprint, tasks, users, products, productModules, jobTypes }) => {
        console.log('Data received - Sprint:', sprint, 'Tasks:', tasks?.length, 'Users:', users?.length, 'Products:', products?.length, 'Modules:', productModules?.length, 'JobTypes:', jobTypes?.length);
        this.sprint = sprint;
        this.tasks = tasks || [];
        this.users = users || [];
        this.products = products || [];
        this.productModules = productModules || [];
        this.jobTypes = jobTypes || [];
        // Enrich tasks with assigneeName if user list available
        if (this.users.length) {
          this.tasks = this.tasks.map(t => {
            const uid = t.assigneeId || t.assigneeUserId || t.assignedto || t.userId;
            if (uid) {
              const u: any = this.users.find(x => x.id === uid);
              if (u) {
                const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
                return { ...t, assigneeName: full || u.username || u.name || ('User ' + uid), dateOfDone: t.dateOfDone || t.date_of_done || null };
              }
            }
            return { ...t, dateOfDone: t.dateOfDone || t.date_of_done || null };
          });
        }
        // Enrich tasks with product & module names for quick template lookup
        if (this.products.length || this.productModules.length) {
          this.tasks = this.tasks.map(t => ({
            ...t,
            productName: this.getProductName(t.productId || t.productid),
            moduleName: this.getModuleName(t.productModuleId || t.productmoduleid)
          }));
        }
        this.hasNoData = this.tasks.length === 0;
        console.log('hasNoData:', this.hasNoData, 'tasks length:', this.tasks.length);
  this.groupTasksToKanban();
  this.buildBurndown();
  this.calculateUserProgress();
        this.isLoading = false;
        
        // Trigger change detection to ensure UI updates
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
        this.isError = true;
        this.hasNoData = false;
      }
    });
  }

  private groupTasksToKanban(): void {
    // Reset columns
    this.kanbanColumns.forEach(c => (c.tasks = []));
    const map: any = {
      'OPEN': 'TODO', 'TO_DO': 'TODO', 'TODO': 'TODO',
      'IN_PROGRESS': 'IN_PROGRESS', 'PROGRESS': 'IN_PROGRESS',
      'REVIEW': 'REVIEW', 'IN_REVIEW': 'REVIEW',
      'DONE': 'DONE', 'COMPLETED': 'DONE'
    };
    for (const t of this.tasks) {
      const key = map[(t.status || '').toUpperCase()] || 'TODO';
      const col = this.kanbanColumns.find(c => c.key === key);
      if (col) col.tasks.push(t);
    }
  }

  /**
   * Calculate user progress based on assigned and accomplished points (storyPoints | points | estimate)
   */
  private calculateUserProgress(): void {
    if (!Array.isArray(this.tasks) || this.tasks.length === 0) {
      this.userProgress = [];
      return;
    }

    const normalizeStatus = (s: any) => String(s || '').toUpperCase().replace(/\s+/g, '_');

    interface Aggregated {
      userId: number;
      userName: string;
      userEmail?: string;
      avatar?: string;
      assignedPoints: number;
      accomplishedPoints: number;
      inProgressPoints: number;
      remainingPoints: number;
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
    }

    const byUser = new Map<number, Aggregated>();

    for (const task of this.tasks) {
      // Derive points
      const pts = Number(task?.storyPoints ?? task?.points ?? task?.estimate ?? 0) || 0;
      const status = normalizeStatus(task?.status);
  const userId: number | undefined = task?.assigneeId ?? task?.assigneeID ?? task?.assigneeUserId ?? task?.assignedto ?? task?.userId; // expanded fallbacks
      if (!userId) continue; // skip tasks without an identifiable user

      if (!byUser.has(userId)) {
        byUser.set(userId, {
          userId,
          userName: (() => {
            if (this.users.length) {
              const u: any = this.users.find(x => x.id === userId);
              if (u) {
                const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
                return full || u.username || u.name || `User ${userId}`;
              }
            }
            return task?.assigneeName || task?.assignee || `User ${userId}`;
          })(),
          userEmail: task?.assigneeEmail,
          avatar: task?.assigneeAvatar,
          assignedPoints: 0,
          accomplishedPoints: 0,
          inProgressPoints: 0,
          remainingPoints: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0
        });
      }
      const agg = byUser.get(userId)!;
      agg.assignedPoints += pts;
      agg.totalTasks += 1;
      if (status === 'DONE' || status === 'COMPLETED') {
        agg.accomplishedPoints += pts;
        agg.completedTasks += 1;
      } else if (status === 'IN_PROGRESS' || status === 'PROGRESS') {
        agg.inProgressPoints += pts;
        agg.inProgressTasks += 1;
      }
    }

    this.userProgress = Array.from(byUser.values()).map(u => {
      const remaining = Math.max(0, u.assignedPoints - u.accomplishedPoints - u.inProgressPoints);
      const progressPercentage = u.assignedPoints > 0 ? Math.round((u.accomplishedPoints / u.assignedPoints) * 100) : 0;
      const pendingTasks = Math.max(0, u.totalTasks - u.completedTasks - u.inProgressTasks);

      let efficiency: 'High' | 'Medium' | 'Low';
      if (progressPercentage >= 80) efficiency = 'High';
      else if (progressPercentage >= 50) efficiency = 'Medium';
      else efficiency = 'Low';

      return {
        userId: u.userId,
        userName: u.userName,
        userEmail: u.userEmail,
        avatar: u.avatar,
        assignedPoints: u.assignedPoints,
        accomplishedPoints: u.accomplishedPoints,
        inProgressPoints: u.inProgressPoints,
        remainingPoints: remaining,
        progressPercentage,
        totalTasks: u.totalTasks,
        completedTasks: u.completedTasks,
        inProgressTasks: u.inProgressTasks,
        pendingTasks,
        efficiency
      };
    });
  }

  private buildBurndown(): void {
    if (!this.sprint) { this.burndown = { labels: [], actual: [], ideal: [] }; return; }
    const start = new Date(this.sprint.fromDate);
    const end = new Date(this.sprint.toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      this.burndown = { labels: [], actual: [], ideal: [] };
      this.renderChart();
      return;
    }
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const labels: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      labels.push(`${d.getMonth()+1}/${d.getDate()}`);
    }
    const totalPoints = this.tasks.reduce((sum, t) => sum + (t.points || t.storyPoints || 0), 0);
    const ideal: number[] = labels.map((_, i) => Math.max(0, totalPoints - (totalPoints * i)/(labels.length-1 || 1)));
    // Actual remaining: subtract points for tasks marked done up to each day
    const completions = this.tasks
      .filter(t => t.status && String(t.status).toUpperCase() === 'DONE')
      .map(t => new Date(t.completedAt || t.updatedAt || end))
      .sort((a,b)=>a.getTime()-b.getTime());
    const actual: number[] = [];
    for (let i = 0; i < labels.length; i++) {
      const current = new Date(start); current.setDate(start.getDate() + i);
      const completedPoints = this.tasks
        .filter(t => t.status && String(t.status).toUpperCase() === 'DONE')
        .filter(t => new Date(t.completedAt || t.updatedAt || end) <= current)
        .reduce((sum, t) => sum + (t.points || t.storyPoints || 0), 0);
      actual.push(Math.max(0, totalPoints - completedPoints));
    }
    this.burndown = { labels, actual, ideal };
    this.renderChart();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  private renderChart(): void {
    // Ensure we have everything
    if (!this.burndownCanvas || !this.burndown || this.burndown.labels.length === 0) {
      // Destroy existing if any
      if (this.chart) { this.chart.destroy(); this.chart = undefined; }
      return;
    }
    const ctx = this.burndownCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    // Recreate chart
    if (this.chart) { this.chart.destroy(); }
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.burndown.labels,
        datasets: [
          {
            label: 'Ideal',
            data: this.burndown.ideal,
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(156,163,175,0.2)',
            borderDash: [6, 6],
            tension: 0.2,
            pointRadius: 0,
          },
          {
            label: 'Actual',
            data: this.burndown.actual,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#3B82F6',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Day' } },
          y: { title: { display: true, text: 'Remaining points' }, beginAtZero: true }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) { this.chart.destroy(); }
    this.routeSubscription.unsubscribe();
  }

  // Tab functionality
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'burndown') {
      // Re-render chart when burndown tab is activated
      setTimeout(() => this.renderChart(), 100);
    }
  }

  // Task filtering
  get filteredTasks(): any[] {
    return this.tasks.filter(task => {
      const matchesTitle = !this.taskFilter.title || 
        task.title?.toLowerCase().includes(this.taskFilter.title.toLowerCase());
      const matchesStatus = !this.taskFilter.status || task.status === this.taskFilter.status;
      const matchesAssignee = !this.taskFilter.assignee || 
        task.assignee?.toLowerCase().includes(this.taskFilter.assignee.toLowerCase());
      
      return matchesTitle && matchesStatus && matchesAssignee;
    });
  }

  clearFilters(): void {
    this.taskFilter = {
      title: '',
      status: '',
      assignee: ''
    };
  }

  // Drag and drop for Kanban
  onDragStart(event: DragEvent, task: any): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(task));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStatus: string): void {
    event.preventDefault();
    const taskData = event.dataTransfer?.getData('text/plain');
    if (taskData) {
      try {
        const task = JSON.parse(taskData);
        this.moveTask(task, targetStatus);
      } catch (e) {
        console.error('Error parsing task data:', e);
      }
    }
  }

  moveTask(task: any, newStatus: string): void {
    // Remove from current column
    this.kanbanColumns.forEach(col => {
      col.tasks = col.tasks.filter(t => t.id !== task.id);
    });

    // Add to new column
    const targetColumn = this.kanbanColumns.find(col => col.key === newStatus);
    if (targetColumn) {
      task.status = newStatus;
      targetColumn.tasks.push(task);
    }

    // Update task in main tasks array
    const taskIndex = this.tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = newStatus;
    }
  }

  // KPI calculations
  getTaskCountByStatus(status: string): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  getTotalStoryPoints(): number {
    return this.tasks.reduce((sum, task) => sum + (task.estimate || 0), 0);
  }

  getCompletedStoryPoints(): number {
    return this.tasks
      .filter(task => task.status === 'DONE')
      .reduce((sum, task) => sum + (task.estimate || 0), 0);
  }

  getSprintProgress(): number {
    const total = this.getTotalStoryPoints();
    const completed = this.getCompletedStoryPoints();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  // Exposed helpers for template (efficiency + color lookups)
  getEfficiencyColor(efficiency: string): string {
    switch (efficiency) {
      case 'High': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#EF4444';
      default: return '#6B7280';
    }
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    if (percentage >= 25) return '#F97316';
    return '#EF4444';
  }

  // Mirror tasks.component helper to resolve assignee name by user id
  getAssigneeName(id?: number): string {
    if (!id) return '—';
    const u: any = this.users?.find((x: any) => x.id === id);
    if (u) {
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
      return full || u.username || u.name || ('User ' + id);
    }
    return 'User ' + id;
  }

  // Map taskType id/string to human readable (Design, QA, RND, etc.) reused from tasks module logic
  getTaskTypeLabel(taskType?: string | number): string {
    if (!taskType) return '—';
    if (typeof taskType === 'string' && isNaN(Number(taskType))) return taskType; // already a label
    const id = typeof taskType === 'string' ? Number(taskType) : taskType;
    const jt = this.jobTypes.find(j => j.id === id);
    return jt?.type || this.fallbackTaskType(id);
  }

  private fallbackTaskType(id: number): string {
    // Provide graceful labels if jobTypes not loaded yet (common conventions)
    const map: Record<number,string> = {
      1: 'Design',
      2: 'Development',
      3: 'QA',
      4: 'R&D',
      5: 'Support'
    };
    return map[id] || 'Task';
  }

  getModuleName(moduleId?: number): string {
    if (!moduleId) return '—';
    const m = this.productModules.find(pm => pm.id === moduleId);
    return m?.name || '—';
  }

  getModulesForProduct(productId?: number): ProductModule[] {
    if (!productId) return this.productModules;
    return this.productModules.filter(m => m.productId === productId);
  }

  getProductName(productId?: number): string {
    if (!productId) return '—';
    const p = this.products.find(pr => pr.id === productId);
    return p?.name || '—';
  }

  // Track by function for task table performance
  trackByTaskId(index: number, task: any): any {
    return task.id || index;
  }

  // UI action handlers
  addTask(): void { 
    this.openAddTasksDialog(); 
  }
  
  refreshData(): void { 
    this.loadSprintSummary(); 
    this.loadSprintTasks(); 
  }
  
  exportData(): void { 
    // placeholder 
  }

  // Open assign dialog (placeholder - to be implemented or integrated with existing user selection UI)
  openAssignDialog(task: any): void {
    // Re-purposed for comments: open comments dialog
    if (task?.id) {
      this.showCommentsForTaskId = task.id;
      this.cdr.detectChanges();
    }
  }

  removeTaskFromSprint(task: any): void {
    console.log('Remove from sprint clicked for task', task.id);
    // Soft removal: set sprintId null via service (placeholder)
    // TODO: integrate with backend endpoint if available
    if (!task) return;
    if (confirm('Remove this task from sprint without deleting it?')) {
      // Optimistic UI update
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      this.groupTasksToKanban();
      this.calculateUserProgress();
      this.buildBurndown();
      this.cdr.detectChanges();
      // TODO: call service when API exists
    }
  }

  editTask(task: any): void {
    if (!task) return;
    this.editingTaskId = task.id;
    this.editBuffer = {
      status: task.status,
      assigneeId: task.assigneeId || task.assigneeUserId || task.assignedto,
      points: Number(task.storyPoints ?? task.points ?? task.estimate ?? 0),
      taskType: task.taskType || task.tasktypeid,
      productModuleId: task.productModuleId || task.productmoduleid,
      deadline: task.deadline ? (typeof task.deadline === 'string' ? task.deadline.substring(0,10) : task.deadline) : null
    };
    this.originalPointsForCalc = this.editBuffer.points || 0;
    // Do not auto open yet—will open when user focuses the points field
    this.cdr.detectChanges();
  }

  isEditDirty(task: any): boolean {
    if (!task || this.editingTaskId !== task.id) return false;
    const originalPoints = Number(task.points || task.storyPoints || 0);
    const originalTaskType = task.taskType || task.tasktypeid;
    const originalModule = task.productModuleId || task.productmoduleid;
    const originalDeadline = task.deadline ? (typeof task.deadline === 'string' ? task.deadline.substring(0,10) : task.deadline) : null;
    return !(
      task.status === this.editBuffer.status &&
      task.assigneeId === this.editBuffer.assigneeId &&
      originalPoints === (this.editBuffer.points ?? originalPoints) &&
      originalTaskType === (this.editBuffer.taskType ?? originalTaskType) &&
      originalModule === (this.editBuffer.productModuleId ?? originalModule) &&
      originalDeadline === (this.editBuffer.deadline ?? originalDeadline)
    );
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editBuffer = {};
    this.cdr.detectChanges();
  }

  saveInline(task: any): void {
    if (!task || this.editingTaskId !== task.id) return;
    if (this.inlineSaving) return; // prevent double submit
    const originalStatus = task.status;
    const originalAssignee = task.assigneeId;
    const originalPoints = Number(task.points || task.storyPoints || 0);
    const originalTaskType = task.taskType || task.tasktypeid;
    const originalModule = task.productModuleId || task.productmoduleid;
    const originalDeadline = task.deadline ? (typeof task.deadline === 'string' ? task.deadline.substring(0,10) : task.deadline) : null;
    const newStatus = this.editBuffer.status;
    const newAssignee = this.editBuffer.assigneeId;
    const newPoints = this.editBuffer.points ?? originalPoints;
    const newTaskType = this.editBuffer.taskType ?? originalTaskType;
    const newModule = this.editBuffer.productModuleId ?? originalModule;
    const newDeadline = this.editBuffer.deadline ?? originalDeadline;
    const noChange = originalStatus===newStatus && originalAssignee===newAssignee && originalPoints===newPoints && originalTaskType===newTaskType && originalModule===newModule && originalDeadline===newDeadline;
    if (noChange) { this.cancelEdit(); return; }
    // Prepare backend payload similar to tasks.component saveTask mapping
    const payload: any = {
      status: newStatus,
      priority: task.priority,
      title: task.title,
      description: task.description,
      deadline: newDeadline || null,
      assignedto: newAssignee ?? task.assigneeId ?? null,
      assigneeId: newAssignee ?? task.assigneeId ?? null,
      points: newPoints ?? task.points ?? 0,
      storyPoints: newPoints ?? task.storyPoints ?? 0,
      taskType: newTaskType,
      tasktypeid: newTaskType,
      productid: task.productId ?? task.productid ?? null,
      productModuleId: newModule ?? null,
      sprintid: this.sprintId,
      sprintId: this.sprintId,
      teamId: task.teamId ?? null,
      teamid: task.teamId ?? null,
      mitsId: task.mitsId || task.mitsNo || task.id
    };

    // If transitioning to DONE and no dateOfDone yet, set locally (backend will persist if controller logic exists there for tasks endpoint)
    if ((newStatus === 'DONE' || newStatus === 'COMPLETED') && !task.dateOfDone) {
      const nowIso = new Date().toISOString();
      payload.dateOfDone = nowIso;
      task.dateOfDone = nowIso;
    }

    // Apply local optimistic changes
    task.status = newStatus;
    task.assigneeId = newAssignee;
    task.points = newPoints;
    task.storyPoints = newPoints;
    task.taskType = newTaskType;
    task.tasktypeid = newTaskType;
    task.productModuleId = newModule;
    task.productmoduleid = newModule;
    task.deadline = newDeadline;

    // Persist
    this.inlineSaving = task.id;
    this.http.put(`${environment.apiUrl}/api/tasks/${task.id}`, payload).subscribe({
      next: () => {
        this.inlineSaving = null;
        // finalize edit state
        this.editingTaskId = null;
        this.editBuffer = {};
        this.showInlineCalcFor = null;
        this.groupTasksToKanban();
        this.calculateUserProgress();
        this.buildBurndown();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to persist task inline edit', err);
        this.inlineSaving = null;
        // Optionally revert? For now keep optimistic & mark error.
        this.editingTaskId = null;
        this.editBuffer = {};
        this.showInlineCalcFor = null;
        this.cdr.detectChanges();
      }
    });
  }

  onPointsFieldFocus(task: any) {
    if (!task || this.editingTaskId !== task.id) return;
    // Guard against immediate reopen right after a close (user clicked Apply/Cancel)
    if (Date.now() < this.ignoreFocusUntil) {
      return;
    }
    // Open calculator immediately
    if (this.showInlineCalcFor !== task.id) {
      this.showInlineCalcFor = task.id;
      this.inlineCalcReset++;
      // prevent immediate outside-click close (same event cycle)
      this.suppressCloseUntil = Date.now() + 120; // 120ms buffer
      this.cdr.detectChanges();
        document.body.classList.add('no-scroll');
        // Defer opening to next microtask so originating click is finished
        Promise.resolve().then(() => {
          this.showInlineCalcFor = task.id;
          this.inlineCalcReset++;
          this.suppressCloseUntil = Date.now() + 120; // still keep guard for keyboard focus cases
          this.cdr.detectChanges();
          document.body.classList.add('no-scroll');
        });
    }
  }

    openCalculatorForTask(task: any) {
      if (!task) return;
      if (this.editingTaskId !== task.id) {
        this.editTask(task);
      }
      this.onPointsFieldFocus(task);
    }

  onInlineCalcPoints(points: number, task: any) {
    if (this.editingTaskId === task.id) {
      this.editBuffer.points = points;
      // Close immediately after applying per requirement
      this.closeInlineCalc(true);
    }
  }

  closeInlineCalc(suppressReopen: boolean = true) {
    if (suppressReopen) {
      // Suppress focus-triggered reopen for a short window
      this.ignoreFocusUntil = Date.now() + 300; // 300ms is enough to allow blur
      // Blur any active element (e.g., the points input) so it doesn't refocus
      const active = document.activeElement as HTMLElement | null;
      if (active && typeof active.blur === 'function') {
        active.blur();
      }
    }
    this.showInlineCalcFor = null;
    this.cdr.detectChanges();
    document.body.classList.remove('no-scroll');
  }

  // Removed global document click handler; backdrop <div class="pc-overlay"> now handles close.

  @HostListener('window:keydown', ['$event']) onKey(ev: KeyboardEvent) {
    if (ev.key === 'Escape' && this.showInlineCalcFor) {
      this.closeInlineCalc();
      ev.stopPropagation();
    }
  }

  openAddTasksDialog(): void {
    this.showAddTasksDialog = true;
    // Under zoneless change detection we need to manually flush the state change
    this.cdr.detectChanges();
  }

  closeAddTasksDialog(): void {
    this.showAddTasksDialog = false;
    this.cdr.detectChanges();
  }

  // Comments dialog handlers
  closeCommentsDialog(): void {
    this.showCommentsForTaskId = null;
    this.cdr.detectChanges();
  }

  onTasksAdded(taskIds: number[]): void {
    console.log('Tasks added to sprint:', taskIds);
    // Refresh the sprint data to show newly added tasks
    this.fetchAll();
    this.closeAddTasksDialog();
  }

  // Helper methods for dialog (since it needs teamId and sprintId)
  loadSprintSummary(): void {
    // Reload sprint details
    if (this.sprintId) {
      this.sprintService.getSprintById(this.sprintId).subscribe({
        next: (sprint) => {
          this.sprint = sprint;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading sprint summary:', error);
        }
      });
    }
  }

  loadSprintTasks(): void {
    // Reload sprint tasks
    if (this.sprintId) {
      const users$ = this.users.length ? [] : this.http.get<User[]>(`${environment.apiUrl}/api/users`);
      if (Array.isArray(users$)) {
        // Only tasks call if users already loaded
        this.taskService.getTasksBySprint(this.sprintId).subscribe({
          next: (tasks) => {
            this.tasks = tasks || [];
            this.hasNoData = this.tasks.length === 0;
            this.groupTasksToKanban();
            this.buildBurndown();
            this.calculateUserProgress();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading sprint tasks:', error);
          }
        });
      } else {
        forkJoin({
          tasks: this.taskService.getTasksBySprint(this.sprintId),
          users: users$
        }).subscribe({
          next: ({ tasks, users }) => {
            this.tasks = tasks || [];
            if (users) this.users = users;
            this.hasNoData = this.tasks.length === 0;
            this.groupTasksToKanban();
            this.buildBurndown();
            this.calculateUserProgress();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading sprint tasks/users:', error);
          }
        });
      }
    }
  }
}
