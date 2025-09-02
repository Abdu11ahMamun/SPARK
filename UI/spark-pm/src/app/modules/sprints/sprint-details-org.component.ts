// Clean re-write after earlier merge corruption; duplicates removed.
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';
import { SprintService, SprintCapacitySummary, SprintUserProgress } from './sprint.service';
import { SprintAddTasksDialogComponent } from './sprint-add-tasks-dialog.component';
import { TaskService } from '../tasks/task.service';
import { TaskItem } from '../tasks/task.model';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-sprint-details-org',
  standalone: true,
  imports: [CommonModule, SprintAddTasksDialogComponent],
  templateUrl: './sprint-details-org.component.html',
  styleUrls: ['./sprint-details-org.component.scss']
})
export class SprintDetailsOrgComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab = 'summary';
  showAddTasksDialog = false;
  teamId: number | null = null; // TODO derive real team id
  sprintId: number | null = null;
  sprintSummary: SprintCapacitySummary | null = null;
  summary: SprintCapacitySummary | null = null; // legacy alias
  loading = false;
  error: string | null = null;

  tasksData: TaskItem[] = [];
  kanbanColumns: { key: string; title: string; class: string; items: any[] }[] = [];
  userProgress: { 
    initials: string; 
    name: string; 
    tasksDone: number; 
    tasksTotal: number; 
    ptsDone: number; 
    ptsTotal: number; 
    pct: number; 
    utilization?: number; 
    velocity?: number;
    utilizationPercentage?: number;
    velocityPointsPerDay?: number;
    overAllocated?: boolean;
  }[] = [];
  dummyUsers: any[] = [];

  private kpiChart?: Chart;
  @ViewChild('kpiChart') kpiChartRef?: ElementRef<HTMLCanvasElement>;

  private usersLoaded = false;
  private tasksLoaded = false;
  private userMap: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private sprintService: SprintService,
    private taskService: TaskService,
    private userService: UserService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) { this.error = 'Missing sprint id in route'; return; }
    this.sprintId = parseInt(idParam, 10);
    // Derive team id from sprint details (tramId field) so dialog can query undone tasks
    this.sprintService.getSprintById(this.sprintId).subscribe({
      next: s => { this.teamId = (s as any).tramId ?? null; },
      error: () => { /* non-fatal */ }
    });
    this.loadUsers();
    this.loadSprintSummary();
    this.loadSprintTasks();
  }

  ngAfterViewInit(): void { if (this.sprintSummary) this.initKpiChart(); }
  ngOnDestroy(): void { if (this.kpiChart) try { this.kpiChart.destroy(); } catch {} }

  onTabChange(tab: string): void {
    if (this.activeTab === tab) return;
    if (this.activeTab === 'summary' && tab !== 'summary' && this.kpiChart) { try { this.kpiChart.destroy(); } catch {}; this.kpiChart = undefined; }
    this.activeTab = tab;
    if (tab === 'summary') setTimeout(()=>this.initKpiChart(),0);
  }

  // UI action handlers
  addTask(): void { this.openAddTasksDialog(); }
  refreshData(): void { this.loadSprintSummary(); this.loadSprintTasks(); }
  exportData(): void { /* placeholder */ }

  openAddTasksDialog(): void {
  this.showAddTasksDialog = true;
  // Under zoneless change detection we need to manually flush the state change
  this.cdr.detectChanges();
  }

  onTasksAdded(ids: number[]): void {
    if (ids?.length) this.notification.success('Tasks Added', `${ids.length} task(s) added to sprint.`);
    this.loadSprintTasks();
    this.loadSprintSummary();
  }

  closeDialog(): void { 
    this.showAddTasksDialog = false; 
    this.cdr.detectChanges();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.userMap = {};
        for (const u of users) { const anyU: any = u; if (anyU.id != null) this.userMap[anyU.id] = this.composeUserDisplayName(anyU); }
        this.usersLoaded = true;
  if (this.tasksLoaded) { this.loadBackendUserProgress(); }
      },
  error: err => { console.warn('User load failed', err); this.usersLoaded = true; if (this.tasksLoaded) { this.loadBackendUserProgress(); } }
    });
  }

  private composeUserDisplayName(u: any): string {
    const parts = [u.firstName, u.lastName].filter(Boolean);
    if (parts.length) return parts.join(' ');
    return u.username || ('User ' + (u.id ?? ''));
  }

  loadSprintSummary(): void {
    if (!this.sprintId) return;
    this.loading = true; this.error = null;
    this.sprintService.getSprintCapacitySummary(this.sprintId).subscribe({
      next: summary => { this.sprintSummary = summary; this.summary = summary; this.loading = false; this.cdr.detectChanges(); this.initKpiChart(); },
      error: _ => { this.error = 'Failed to load sprint summary'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  private loadSprintTasks(): void {
    if (!this.sprintId) return;
    this.taskService.getTasksBySprint(this.sprintId).subscribe({
      next: tasks => {
        this.tasksData = tasks;
        this.buildKanbanFromTasks();
        this.tasksLoaded = true;
  if (this.usersLoaded) this.loadBackendUserProgress();
        if (this.activeTab === 'summary') setTimeout(()=>this.initKpiChart(),0);
        this.cdr.detectChanges();
      },
      error: err => { this.tasksLoaded = true; console.error('Failed to load sprint tasks', err); }
    });
  }

  private buildKanbanFromTasks(): void {
    const columnsMap: Record<string, { key: string; title: string; class: string; items: any[] }> = {
      OPEN: { key: 'todo', title: 'To-Do', class: 'todo', items: [] },
      IN_PROGRESS: { key: 'progress', title: 'In Progress', class: 'progress', items: [] },
      BLOCKED: { key: 'review', title: 'Blocked', class: 'review', items: [] },
      DONE: { key: 'done', title: 'Done', class: 'done', items: [] },
      CANCELLED: { key: 'cancelled', title: 'Cancelled', class: 'done', items: [] }
    };
    for (const t of this.tasksData) {
      const col = columnsMap[t.status];
      if (col) col.items.push({ ref: t.mitsNo || ('#' + t.id), title: t.title, priority: t.priority, owner: (t as any).assigneeUserId ?? '-' });
    }
    this.kanbanColumns = Object.values(columnsMap).filter(c=>c.items.length>0);
  }

  private loadBackendUserProgress(): void {
    if (!this.sprintId) return;
    this.sprintService.getSprintUserProgress(this.sprintId).subscribe({
      next: (rows: SprintUserProgress[]) => {
        if (!rows || !rows.length) { this.buildUserProgressFallback(); return; }
        this.userProgress = rows.map(r => {
          const pct = r.completionPercentage ?? (r.tasksTotal ? Math.round((r.tasksDone / r.tasksTotal)*100) : 0);
          const initials = (r.userName||'').split(/\s+/).map(p=>p[0]).join('').toUpperCase().slice(0,2) || 'NA';
          return {
            initials,
            name: r.userName,
            tasksDone: r.tasksDone,
            tasksTotal: r.tasksTotal,
            ptsDone: r.pointsDone,
            ptsTotal: r.pointsTotal,
            pct,
            utilization: r.utilizationPercentage,
            velocity: r.velocityPointsPerDay,
            utilizationPercentage: r.utilizationPercentage,
            velocityPointsPerDay: r.velocityPointsPerDay,
            overAllocated: r.overAllocated
          };
        });
        this.dummyUsers = this.userProgress;
        this.cdr.detectChanges();
      },
      error: err => {
        console.warn('Backend user-progress failed, using fallback', err);
        this.buildUserProgressFallback();
      }
    });
  }

  private buildUserProgressFallback(): void {
    const by: Record<string, { display: string; tasksDone: number; tasksTotal: number; ptsDone: number; ptsTotal: number }> = {};
    for (const t of this.tasksData) {
      const assignee: any = (t as any).assigneeUserId ?? (t as any).assigneeId ?? (t as any).userId;
      const key = assignee != null ? String(assignee) : 'unassigned';
      if (!by[key]) {
        let display: string;
        if (key === 'unassigned') display = 'Unassigned'; else display = this.userMap[Number(key)] || ('User ' + key);
        by[key] = { display, tasksDone:0, tasksTotal:0, ptsDone:0, ptsTotal:0 };
      }
      const bucket = by[key];
      bucket.tasksTotal++;
      if ((t as any).points) bucket.ptsTotal += (t as any).points;
      if (t.status === 'DONE') { bucket.tasksDone++; if ((t as any).points) bucket.ptsDone += (t as any).points; }
    }
    this.userProgress = Object.values(by).map(v => {
      const pct = v.tasksTotal ? Math.round((v.tasksDone / v.tasksTotal) * 100) : 0;
      const initials = v.display.split(/\s+/).map(p=>p[0]).join('').toUpperCase().slice(0,2) || 'NA';
      return { initials, name: v.display, tasksDone: v.tasksDone, tasksTotal: v.tasksTotal, ptsDone: v.ptsDone, ptsTotal: v.ptsTotal, pct };
    }).sort((a,b)=>a.name.localeCompare(b.name));
    this.dummyUsers = this.userProgress;
    this.cdr.detectChanges();
  }

  private initKpiChart(): void {
    if (!this.kpiChartRef) return;
    if (this.kpiChart) { try { this.kpiChart.destroy(); } catch {}; this.kpiChart = undefined; }
    const ctx = this.kpiChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    const totalTasks = this.tasksData.length;
    const done = this.tasksData.filter(t=>t.status==='DONE').length;
    const inProgress = this.tasksData.filter(t=>t.status==='IN_PROGRESS' || t.status==='OPEN').length;
    const todo = this.tasksData.filter(t=>t.status==='OPEN').length;
    const review = this.tasksData.filter(t=>t.status==='BLOCKED').length;
    const scopeRemaining = Math.max(0, (this.sprintSummary?.totalPotentialHours || 26) - totalTasks);
    this.kpiChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Done','In Progress','To-Do','Review','Scope Remaining'],
        datasets: [
          {
            data: [done, inProgress, todo, review, scopeRemaining],
            backgroundColor: [
              'rgba(16,185,129,0.85)',
              'rgba(234,179,8,0.85)',
              'rgba(59,130,246,0.85)',
              'rgba(139,92,246,0.85)',
              'rgba(239,68,68,0.85)'
            ],
            borderColor: 'rgba(255,255,255,0.25)',
            borderWidth: 2,
            hoverOffset: 10,
            spacing: 2,
            cutout: '55%'
          } as any
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        layout: { padding: 4 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#475569',
              boxWidth: 14,
              boxHeight: 14,
              padding: 10,
              font: { size: 11, weight: 500 }
            }
          },
          title: {
            display: true,
            text: `Task Distribution (${totalTasks})`,
            color: '#1e293b',
            font: { size: 14, weight: 600 }
          }
        },
        animation: { animateRotate: true, animateScale: true },
        interaction: { mode: 'nearest' }
      }
    });
  }
}

// NOTE: SprintCapacitySummary contract currently lacks extra sprint metadata (name/dates); template adjusted accordingly.
