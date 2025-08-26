import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SprintService, Sprint } from './sprint.service';
import { TaskService } from '../tasks/task.service';
import { TeamService } from '../teams/team.service';
import { Team } from '../teams/team.model';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-sprint-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sprint-details.component.html',
  styleUrls: ['./sprint-details.component.scss']
})
export class SprintDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  sprintId!: number;
  isLoading = true;
  isError = false;

  // Placeholders to be wired to services later
  sprint: Sprint | null = null;
  team: Team | null = null;
  tasks: any[] = [];
  kanbanColumns: { key: string; title: string; tasks: any[] }[] = [
    { key: 'TODO', title: 'To-Do', tasks: [] },
    { key: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
    { key: 'REVIEW', title: 'Review', tasks: [] },
    { key: 'DONE', title: 'Done', tasks: [] },
  ];
  burndown: { labels: string[]; actual: number[]; ideal: number[] } | null = null;
  private chart?: Chart<any, any, any>;

  @ViewChild('burndownCanvas') burndownCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sprintService: SprintService,
    private taskService: TaskService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.sprintId = id;
    }

  // Load sprint and tasks
  this.fetchAll();
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
    this.isLoading = true;
    this.isError = false;
    forkJoin({
      sprint: this.sprintService.getSprintById(this.sprintId),
  tasks: this.taskService.getTasksBySprint(this.sprintId)
    }).subscribe({
      next: ({ sprint, tasks }) => {
        this.sprint = sprint;
        this.tasks = tasks || [];
        this.groupTasksToKanban();
        this.buildBurndown();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.isError = true;
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
      if (this.chart) { (this.chart as any).destroy(); this.chart = undefined; }
      return;
    }
    const ctx = this.burndownCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    // Recreate chart
    if (this.chart) { (this.chart as any).destroy(); }
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
    if (this.chart) { (this.chart as any).destroy(); }
  }
}
