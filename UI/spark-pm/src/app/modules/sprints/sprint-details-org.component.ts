import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SprintService, SprintCapacitySummary } from './sprint.service';
import { ChangeDetectorRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-sprint-details-org',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sprint-details-org.component.html',
  styleUrls: ['./sprint-details-org.component.scss']
})
export class SprintDetailsOrgComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: string = 'summary';
  sprintId: number | null = null;
  sprintSummary: SprintCapacitySummary | null = null;
  // Legacy alias to satisfy older template bindings still in cache (summary?.field)
  summary: SprintCapacitySummary | null = null;
  loading = false;
  error: string | null = null;
  // Dummy user progress data (light-theme design)
  userProgress: { initials: string; name: string; tasksDone: number; tasksTotal: number; ptsDone: number; ptsTotal: number; pct: number }[] = [
    { initials: 'AK', name: 'Alice Khan', tasksDone: 7, tasksTotal: 10, ptsDone: 13, ptsTotal: 20, pct: 70 },
    { initials: 'BR', name: 'Bilal Rahman', tasksDone: 4, tasksTotal: 7, ptsDone: 7, ptsTotal: 12, pct: 57 },
    { initials: 'CT', name: 'Chitra Talukdar', tasksDone: 3, tasksTotal: 3, ptsDone: 5, ptsTotal: 5, pct: 100 }
  ];
  // Legacy dummyUsers array kept for backward compatibility with earlier template revision
  dummyUsers = this.userProgress;
  tasksData: any[] = [
    { id:101, ref:'#A1', title:'Login page', type:'FEATURE', product:'SPARK', client:'ACME', sprint:'S-12', priority:'HIGH', category:'Frontend', person:'Alice', status:'IN_PROGRESS', size:5, est:8, pts:3 },
    { id:102, ref:'#A2', title:'Fix checkout bug', type:'BUG', product:'SPARK', client:'ACME', sprint:'S-12', priority:'CRITICAL', category:'Backend', person:'Bilal', status:'TODO', size:3, est:6, pts:0 },
    { id:103, ref:'#A3', title:'Improve reports', type:'CHORE', product:'SPARK', client:'ACME', sprint:'S-12', priority:'MEDIUM', category:'Analytics', person:'Chitra', status:'DONE', size:2, est:5, pts:2 }
  ];
  kanbanColumns = [
    { key:'todo', title:'To-Do', class:'todo', items:[ { ref:'#102', title:'Fix checkout bug', priority:'CRITICAL', owner:'Bilal' } ] },
    { key:'progress', title:'In Progress', class:'progress', items:[ { ref:'#101', title:'Login page', priority:'HIGH', owner:'Alice' } ] },
    { key:'review', title:'Review', class:'review', items:[ { ref:'#110', title:'Add code owners', priority:'MEDIUM', owner:'Chitra' } ] },
    { key:'done', title:'Done', class:'done', items:[ { ref:'#103', title:'Improve reports', priority:'MEDIUM', owner:'Chitra' } ] }
  ];
  private kpiChart?: Chart;
  @ViewChild('kpiChart') kpiChartRef?: ElementRef<HTMLCanvasElement>;

  constructor(
  private route: ActivatedRoute,
  private sprintService: SprintService,
  private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('SprintDetailsOrgComponent - ngOnInit called');
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('Sprint ID param from route:', idParam);
    if (idParam) {
      this.sprintId = parseInt(idParam, 10);
      console.log('Parsed Sprint ID:', this.sprintId);
      this.loadSprintSummary();
    } else {
      console.error('No sprint ID found in route parameters');
    }
  }

  ngAfterViewInit(): void {
    // If summary already loaded by the time view init runs, build chart.
    if (this.sprintSummary) this.initKpiChart();
  }

  private initKpiChart(): void {
    if (!this.kpiChartRef) return;
    // Always recreate to handle tab toggling where canvas element is destroyed/recreated
    if (this.kpiChart) {
      try { this.kpiChart.destroy(); } catch(e) { console.warn('Failed to destroy existing chart before re-init', e); }
      this.kpiChart = undefined;
    }
    const ctx = this.kpiChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    const totalTasks = this.tasksData.length;
    const done = this.tasksData.filter(t=>t.status==='DONE').length;
    const inProgress = this.tasksData.filter(t=>t.status==='IN_PROGRESS').length;
    const todo = this.tasksData.filter(t=>t.status==='TODO').length;
    const review = this.tasksData.filter(t=>t.status==='REVIEW').length;
    const scopeRemaining = Math.max(0, (this.sprintSummary?.totalPotentialHours || 26) - totalTasks); // placeholder logic
    this.kpiChart = new Chart(ctx, {
      type:'pie',
      data:{
        labels:['Done','In Progress','To-Do','Review','Scope Remaining'],
        datasets:[{
          data:[done, inProgress, todo, review, scopeRemaining],
          backgroundColor:['#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444'],
          borderColor:'#fff',
          borderWidth:2
        }]
      },
      options:{
        plugins:{
          legend:{ position:'bottom', labels:{ color:'#475569' } },
          title:{ display:true, text:`Task Distribution (Total: ${totalTasks})`, color:'#1e293b', font:{ size:14, weight:600 } }
        }
      }
    });
  }

  onTabChange(tab: string): void {
    if (this.activeTab === tab) return;
    // If leaving summary, clean up chart to ensure fresh init on return
    if (this.activeTab === 'summary' && tab !== 'summary' && this.kpiChart) {
      try { this.kpiChart.destroy(); } catch(e) { console.warn('Error destroying chart on tab leave', e); }
      this.kpiChart = undefined;
    }
    this.activeTab = tab;
    // Re-init after DOM renders when entering summary
    if (tab === 'summary') {
      setTimeout(() => this.initKpiChart(), 0);
    }
  }

  loadSprintSummary(): void {
    if (!this.sprintId) {
      console.error('Cannot load sprint summary: sprintId is null');
      return;
    }
    
    console.log('Loading sprint summary for ID:', this.sprintId);
    this.loading = true;
    this.error = null;
    
    console.log('Calling sprintService.getSprintCapacitySummary...');
    this.sprintService.getSprintCapacitySummary(this.sprintId).subscribe({
      next: (summary) => {
        console.log('Sprint summary received:', summary);
        console.log('Summary properties:', Object.keys(summary));
        console.log('totalTeamMembers:', summary.totalTeamMembers);
        console.log('activeMembers:', summary.activeMembers);
        this.sprintSummary = summary;
  this.summary = summary; // keep legacy alias in sync
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Component state updated, loading set to false');
        console.log('Component sprintSummary:', this.sprintSummary);
        console.log('Component loading:', this.loading);
        this.initKpiChart();
      },
      error: (error) => {
        console.error('Error loading sprint summary:', error);
        console.error('Error details:', error.message, error.status, error.statusText);
        console.error('Full error object:', error);
        this.error = 'Failed to load sprint summary: ' + (error.message || error.statusText || 'Unknown error');
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Error state updated, loading set to false');
      },
      complete: () => {
        console.log('HTTP request completed (either success or error)');
      }
    });
  }

  ngOnDestroy(): void { if (this.kpiChart) { this.kpiChart.destroy(); } }
}

// NOTE: SprintCapacitySummary does not expose sprintName, goal, start/end dates in current service contract; template adjusted accordingly.
