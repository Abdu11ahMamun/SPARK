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

  // Data
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
  private chart?: Chart;

  @ViewChild('burndownCanvas') burndownCanvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sprintService: SprintService,
    private taskService: TaskService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    console.log('SprintDetailsComponent ngOnInit called');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Extracted sprint ID:', id);
    if (!isNaN(id)) {
      this.sprintId = id;
    }

    // Load sprint and tasks - using mock data for now
    this.loadMockData();
    // this.fetchAll(); // Uncomment when backend is ready
  }

  back(): void {
    this.router.navigate(['/sprints']);
  }

  // Format date for display
  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  // Get status display text
  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'Completed';
      case 0: return 'Planned';
      default: return 'Unknown';
    }
  }

  // Get status CSS class
  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-active';
      case 2: return 'status-completed';
      case 0: return 'status-planned';
      default: return 'status-unknown';
    }
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
    console.log('fetchAll() called with sprintId:', this.sprintId);
    this.isLoading = true;
    this.isError = false;
    console.log('Making API calls to:', `${this.sprintService.getAllSprints}`, `${this.taskService}`);
    forkJoin({
      sprint: this.sprintService.getSprintById(this.sprintId),
      tasks: this.taskService.getTasksBySprint(this.sprintId)
    }).subscribe({
      next: ({ sprint, tasks }) => {
        console.log('API calls successful:', { sprint, tasks });
        this.sprint = sprint;
        this.tasks = tasks || [];
        
        // Fetch team data if sprint has team ID
        if (sprint && sprint.tramId) {
          console.log('Fetching team data for tramId:', sprint.tramId);
          this.teamService.getTeam(sprint.tramId).subscribe({
            next: (team) => {
              console.log('Team data received:', team);
              this.team = team;
            },
            error: (teamError) => {
              console.error('Team fetch error:', teamError);
              this.team = null; // Continue without team data
            }
          });
        }
        
        this.groupTasksToKanban();
        this.buildBurndown();
        this.isLoading = false;
        console.log('Component state after API success:', {
          sprint: this.sprint,
          tasks: this.tasks,
          team: this.team,
          isLoading: this.isLoading,
          isError: this.isError
        });
      },
      error: (error) => {
        console.error('API calls failed:', error);
        this.isLoading = false;
        this.isError = true;
        console.log('Component state after API error:', {
          isLoading: this.isLoading,
          isError: this.isError,
          error: error
        });
      }
    });
  }

  loadMockData(): void {
    this.isLoading = true;
    
    // Mock sprint data
    this.sprint = {
      id: this.sprintId,
      sprintName: `Sprint ${this.sprintId} - Q3 Development`,
      fromDate: '2025-08-01',
      toDate: '2025-08-14',
      noOfHolidays: 2,
      sprintPoint: 55,
      tramId: 1,
      status: 1,
      detailsRemark: 'Focus on core features and bug fixes'
    };

    // Mock team data
    this.team = {
      id: 1,
      teamName: 'Alpha Development Team',
      description: 'Core development team',
      status: 1,
      pOwner: 1,
      sMaster: 2,
      createdAt: '2025-01-01'
    };

    // Mock tasks data
    this.tasks = [
      {
        id: 1,
        key: 'SPARK-101',
        title: 'Implement user authentication system',
        assignee: 'John Doe',
        status: 'TODO',
        estimate: 8,
        storyPoints: 5,
        priority: 'High'
      },
      {
        id: 2,
        key: 'SPARK-102',
        title: 'Create responsive dashboard layout',
        assignee: 'Jane Smith',
        status: 'IN_PROGRESS',
        estimate: 13,
        storyPoints: 8,
        priority: 'Medium'
      },
      {
        id: 3,
        key: 'SPARK-103',
        title: 'Setup database migration scripts',
        assignee: 'Bob Wilson',
        status: 'REVIEW',
        estimate: 5,
        storyPoints: 3,
        priority: 'High'
      },
      {
        id: 4,
        key: 'SPARK-104',
        title: 'Write comprehensive unit tests',
        assignee: 'Alice Johnson',
        status: 'DONE',
        estimate: 8,
        storyPoints: 5,
        priority: 'Low',
        completedAt: '2025-08-10'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      this.groupTasksToKanban();
      this.buildBurndown();
      this.isLoading = false;
    }, 800);
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
  }
}
