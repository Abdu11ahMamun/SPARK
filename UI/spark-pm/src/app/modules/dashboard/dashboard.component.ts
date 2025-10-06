import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  activeTeams: number;
  activeSprints: number;
  completionRate: number;
  averageTaskTime: number;
}

interface DeadlineTask {
  id: number;
  title: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  daysLeft: number;
  isOverdue: boolean;
  teamName: string;
  status: string;
}

interface KPIMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: string;
  color: string;
}

interface GrowthData {
  month: string;
  tasksCompleted: number;
  productivity: number;
  teamContribution: number;
}

interface EnhancedTeam {
  id: number;
  name: string;
  role: string;
  activityLevel: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private _stats = signal<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    activeTeams: 0,
    activeSprints: 0,
    completionRate: 0,
    averageTaskTime: 0
  });

  private _deadlines = signal<DeadlineTask[]>([]);
  private _kpis = signal<KPIMetric[]>([]);
  private _growthData = signal<GrowthData[]>([]);
  private _isLoading = signal(true);

  // Computed properties
  stats = computed(() => this._stats());
  deadlines = computed(() => this._deadlines());
  kpis = computed(() => this._kpis());
  growthData = computed(() => this._growthData());
  isLoading = computed(() => this._isLoading());

  // User info with enhanced team data
  userInfo = computed(() => {
    const baseTeams = this.authService.getUserTeams();
    return {
      username: this.authService.username(),
      fullName: this.authService.getUserFullName(),
      teams: baseTeams.map(team => ({
        id: team.id,
        name: team.name,
        role: 'Member', // Default role, could be enhanced with actual role data
        activityLevel: Math.floor(Math.random() * 30) + 70 // 70-100%
      }))
    };
  });

  // Chart data
  taskDistributionData = computed(() => {
    const stats = this._stats();
    return [
      { label: 'Completed', value: stats.completedTasks, color: '#10b981' },
      { label: 'In Progress', value: stats.inProgressTasks, color: '#f59e0b' },
      { label: 'Overdue', value: stats.overdueTasks, color: '#ef4444' },
      { label: 'Pending', value: stats.totalTasks - stats.completedTasks - stats.inProgressTasks - stats.overdueTasks, color: '#6b7280' }
    ];
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private async loadDashboardData() {
    this._isLoading.set(true);
    try {
      await Promise.all([
        this.loadStats(),
        this.loadUpcomingDeadlines(),
        this.loadKPIs(),
        this.loadGrowthData()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  private async loadStats() {
    try {
      // Load user's personal task statistics
      const myTasks = await this.http.get<any[]>(`${environment.apiUrl}/api/my-tasks`).toPromise();
      const allTasks = myTasks || [];

      const completedTasks = allTasks.filter(t => ['DONE', 'COMPLETED'].includes(t.status?.toUpperCase())).length;
      const inProgressTasks = allTasks.filter(t => ['IN_PROGRESS', 'ACTIVE'].includes(t.status?.toUpperCase())).length;
      const overdueTasks = allTasks.filter(t => {
        if (!t.deadline) return false;
        const deadline = new Date(t.deadline);
        const now = new Date();
        return deadline < now && !['DONE', 'COMPLETED'].includes(t.status?.toUpperCase());
      }).length;

      // Get team and sprint info
      const teamInfo = await this.http.get<any[]>(`${environment.apiUrl}/api/teams`).toPromise().catch(() => []);
      const sprintInfo = await this.http.get<any[]>(`${environment.apiUrl}/api/sprints`).toPromise().catch(() => []);

      const activeSprints = (sprintInfo || []).filter(s => s.isActive || s.status === 'ACTIVE').length;
      const userTeams = this.authService.getUserTeams();

      this._stats.set({
        totalTasks: allTasks.length,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        activeTeams: userTeams.length,
        activeSprints,
        completionRate: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
        averageTaskTime: 4.2 // This could be calculated from actual data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadUpcomingDeadlines() {
    try {
      const myTasks = await this.http.get<any[]>(`${environment.apiUrl}/api/my-tasks`).toPromise();
      const tasksWithDeadlines = (myTasks || [])
        .filter(task => task.deadline && !['DONE', 'COMPLETED'].includes(task.status?.toUpperCase()))
        .map(task => {
          const deadline = new Date(task.deadline);
          const now = new Date();
          const diffTime = deadline.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return {
            id: task.id,
            title: task.title,
            deadline: task.deadline,
            priority: task.priority || 'MEDIUM',
            daysLeft,
            isOverdue: daysLeft < 0,
            teamName: task.teamName || 'Unknown Team',
            status: task.status
          } as DeadlineTask;
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 8); // Show top 8 upcoming deadlines

      this._deadlines.set(tasksWithDeadlines);
    } catch (error) {
      console.error('Error loading deadlines:', error);
    }
  }

  private async loadKPIs() {
    const stats = this._stats();
    
    const kpis: KPIMetric[] = [
      {
        label: 'Task Completion Rate',
        current: stats.completionRate,
        target: 85,
        unit: '%',
        trend: stats.completionRate >= 85 ? 'up' : stats.completionRate >= 70 ? 'stable' : 'down',
        change: 12,
        icon: '📈',
        color: '#10b981'
      },
      {
        label: 'Average Task Time',
        current: stats.averageTaskTime,
        target: 3.5,
        unit: 'days',
        trend: stats.averageTaskTime <= 3.5 ? 'up' : 'down',
        change: -0.8,
        icon: '⏱️',
        color: '#3b82f6'
      },
      {
        label: 'Sprint Velocity',
        current: 42,
        target: 45,
        unit: 'points',
        trend: 'up',
        change: 5,
        icon: '🚀',
        color: '#8b5cf6'
      },
      {
        label: 'Quality Score',
        current: 92,
        target: 95,
        unit: '%',
        trend: 'stable',
        change: 2,
        icon: '⭐',
        color: '#f59e0b'
      }
    ];

    this._kpis.set(kpis);
  }

  private async loadGrowthData() {
    // Simulate growth data - in real implementation, this would come from API
    const growthData: GrowthData[] = [
      { month: 'Jun', tasksCompleted: 28, productivity: 78, teamContribution: 85 },
      { month: 'Jul', tasksCompleted: 35, productivity: 82, teamContribution: 88 },
      { month: 'Aug', tasksCompleted: 42, productivity: 86, teamContribution: 92 },
      { month: 'Sep', tasksCompleted: 38, productivity: 89, teamContribution: 94 },
      { month: 'Oct', tasksCompleted: 45, productivity: 91, teamContribution: 96 }
    ];

    this._growthData.set(growthData);
  }

  // Utility methods
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#ca8a04';
      case 'LOW': return '#65a30d';
      default: return '#6b7280';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return '🔥';
      case 'HIGH': return '⚡';
      case 'MEDIUM': return '⚠️';
      case 'LOW': return '📌';
      default: return '📋';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  }

  formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
  }

  getDeadlineStatus(daysLeft: number): string {
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Due Today';
    if (daysLeft === 1) return 'Due Tomorrow';
    return `${daysLeft} days left`;
  }

  async refreshDashboard() {
    await this.loadDashboardData();
  }

  // Chart utility methods
  getCircumference(value: number, total: number): string {
    if (total === 0) return '0 502';
    const circumference = 2 * Math.PI * 80; // radius = 80
    const percentage = value / total;
    const strokeLength = circumference * percentage;
    return `${strokeLength} ${circumference}`;
  }

  getCircumferenceOffset(index: number): number {
    let offset = 0;
    const stats = this._stats();
    const total = stats.totalTasks;
    if (total === 0) return 0;

    const circumference = 2 * Math.PI * 80;
    const values = [stats.completedTasks, stats.inProgressTasks, stats.overdueTasks];
    
    for (let i = 0; i < index; i++) {
      offset += (values[i] / total) * circumference;
    }
    return -offset;
  }

  getGrowthChartPoints(): string {
    return this._growthData()
      .map((point, i) => `${50 + (i * 70)},${180 - (point.tasksCompleted * 3)}`)
      .join(' ');
  }

  getAverageTasksPerMonth(): number {
    const data = this._growthData();
    if (data.length === 0) return 0;
    const total = data.reduce((sum, point) => sum + point.tasksCompleted, 0);
    return Math.round(total / data.length);
  }

  getProductivityTrend(): number {
    const data = this._growthData();
    if (data.length < 2) return 0;
    const first = data[0].productivity;
    const last = data[data.length - 1].productivity;
    return Math.round(((last - first) / first) * 100);
  }

  calculateTeamActivityLevel(teamId: number): number {
    // Simulate team activity level - in real implementation, calculate from actual data
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  }

  getTeamActivityLevel(teamId: number): number {
    return this.calculateTeamActivityLevel(teamId);
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }
}
