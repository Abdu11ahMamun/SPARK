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

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      (this.chart as any).destroy();
    }
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
        key: 'TASK-101',
        title: 'Implement user authentication',
        assignee: 'John Doe',
        status: 'IN_PROGRESS',
        estimate: 8,
        storyPoints: 5,
        priority: 'High'
      },
      {
        id: 2,
        key: 'TASK-102',
        title: 'Design dashboard layout',
        assignee: 'Jane Smith',
        status: 'REVIEW',
        estimate: 6,
        storyPoints: 3,
        priority: 'Medium'
      },
      {
        id: 3,
        key: 'TASK-103',
        title: 'Setup CI/CD pipeline',
        assignee: 'Mike Johnson',
        status: 'DONE',
        estimate: 12,
        storyPoints: 8,
        priority: 'High',
        completedAt: '2025-08-10'
      },
      {
        id: 4,
        key: 'TASK-104',
        title: 'Write unit tests',
        assignee: 'Sarah Wilson',
        status: 'TODO',
        estimate: 4,
        storyPoints: 2,
        priority: 'Low'
      },
      {
        id: 5,
        key: 'TASK-105',
        title: 'API documentation',
        assignee: 'Tom Brown',
        status: 'IN_PROGRESS',
        estimate: 3,
        storyPoints: 1,
        priority: 'Medium'
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
    // Clear existing tasks
    this.kanbanColumns.forEach(c => (c.tasks = []));
    const map: any = {
      'TODO': 'TODO',
      'IN_PROGRESS': 'IN_PROGRESS',
      'REVIEW': 'REVIEW',
      'DONE': 'DONE'
    };
    for (const t of this.tasks) {
      const key = map[(t.status || '').toUpperCase()] || 'TODO';
      const col = this.kanbanColumns.find(c => c.key === key);
      if (col) col.tasks.push(t);
    }
  }

  private buildBurndown(): void {
    if (!this.sprint) { 
      this.burndown = { labels: [], actual: [], ideal: [] }; 
      return; 
    }
    const start = new Date(this.sprint.fromDate);
    const end = new Date(this.sprint.toDate);
    if (!start || !end) {
      this.burndown = { labels: [], actual: [], ideal: [] };
      this.renderChart();
      return;
    }

    const labels: string[] = [];
    const ideal: number[] = [];
    const actual: number[] = [];

    const totalPoints = this.tasks.reduce((sum, t) => sum + (t.points || t.storyPoints || 0), 0);

    // Get task completion dates
    const completions = this.tasks
      .filter(t => t.status && String(t.status).toUpperCase() === 'DONE')
      .map(t => new Date(t.completedAt || t.updatedAt || end))
      .sort((a,b)=>a.getTime()-b.getTime());

    // Build day-by-day burndown
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const completedPoints = this.tasks
        .filter(t => t.status && String(t.status).toUpperCase() === 'DONE')
        .filter(t => new Date(t.completedAt || t.updatedAt || end) <= d)
        .reduce((sum, t) => sum + (t.points || t.storyPoints || 0), 0);

      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      actual.push(totalPoints - completedPoints);
      ideal.push(totalPoints * (1 - (d.getTime() - start.getTime()) / (end.getTime() - start.getTime())));
    }

    this.burndown = { labels, actual, ideal };
    this.renderChart();
  }

  private renderChart(): void {
    // Wait for ViewChild to be available
    if (!this.burndownCanvas || !this.burndown || this.burndown.labels.length === 0) {
      return;
    }
    if (this.chart) { (this.chart as any).destroy(); this.chart = undefined; }

    const ctx = this.burndownCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) { (this.chart as any).destroy(); }
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.burndown.labels,
        datasets: [
          {
            label: 'Ideal',
            data: this.burndown.ideal,
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            fill: false
          },
          {
            label: 'Actual',
            data: this.burndown.actual,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            tension: 0.1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Story Points Remaining'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Sprint Days'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
}
