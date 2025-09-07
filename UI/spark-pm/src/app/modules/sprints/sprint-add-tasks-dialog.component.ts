import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SprintService } from './sprint.service';
import { HttpClient } from '@angular/common/http';

interface DialogTaskItem {
	id: number;
	mitsNo: string;
	title: string;
	productModuleId?: number;
	taskType?: any;
	assigneeUserId?: number;
	status?: string;
	priority?: string;
	deadline?: string;
	points?: number;
	teamId?: number;
}

@Component({
	selector: 'app-sprint-add-tasks-dialog',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './sprint-add-tasks-dialog.component.html',
	styleUrls: ['./sprint-add-tasks-dialog.component.scss']
})
export class SprintAddTasksDialogComponent implements OnInit, OnChanges {
	@Input() open = false;
	@Input() sprintId!: number;
	@Input() teamId!: number; // initial team context
	@Output() close = new EventEmitter<void>();
	@Output() added = new EventEmitter<number[]>();

	loading = false;
	assigning = false;
	error: string | null = null;

	tasks: DialogTaskItem[] = [];
	filtered: DialogTaskItem[] = [];
	selectedIds = new Set<number>();

	// Filters
	search = '';
	statusFilter = '';
	priorityFilter = '';
	typeFilter = '';
	teamFilter: string = '';

	constructor(private sprintService: SprintService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

	ngOnInit(): void { if (this.open) this.load(); }
	ngOnChanges(changes: SimpleChanges): void { if ((changes['open'] && this.open) || (changes['teamId'] && this.open)) this.load(); }

	// Exposed so template (Refresh button) can call it
	load() {
		if (!this.sprintId) return;
		this.loading = true; 
		this.error = null;
		this.tasks = [];
		this.filtered = [];
		
		// Use new simplified endpoint for team undone tasks
		const effectiveTeam = (this.teamFilter || this.teamId);
		console.log('Loading with sprintId:', this.sprintId, 'teamId:', effectiveTeam);
		if (!effectiveTeam) { 
			this.loading = false; 
			this.error = 'Missing team id'; 
			this.cdr.detectChanges();
			return; 
		}
		
		const url = `http://localhost:8080/api/tasks/team/${effectiveTeam}/undone`;
		console.log('Fetching from URL:', url);
		
		this.http.get<DialogTaskItem[]>(url).subscribe({
			next: (list: DialogTaskItem[] | null) => { 
				console.log('Received raw data:', list);
				console.log('Data length:', list?.length || 0);
				
				// Clear filters to show all tasks initially
				this.search = '';
				this.statusFilter = '';
				this.priorityFilter = '';
				this.typeFilter = '';
				this.teamFilter = '';
				
				this.tasks = (list || []).sort((a,b) => (b.id || 0) - (a.id || 0)); 
				console.log('Set tasks array:', this.tasks);
				console.log('Tasks count:', this.tasks.length);
				
				this.apply(); 
				this.loading = false;
				this.cdr.detectChanges(); // Force change detection
			},
			error: (err: any) => { 
				console.error('Error loading tasks:', err); 
				this.error = 'Failed to load tasks'; 
				this.loading = false;
				this.cdr.detectChanges();
			}
		});
	}

	apply() {
		let list = [...this.tasks];
		console.log('Apply called with tasks:', list.length, 'tasks');
		console.log('Current filters - search:', this.search, 'status:', this.statusFilter, 'priority:', this.priorityFilter, 'type:', this.typeFilter);
		
		const term = this.search.toLowerCase();
		if (term) {
			list = list.filter(t => 
				t.title?.toLowerCase().includes(term) || 
				t.mitsNo?.toLowerCase().includes(term)
			);
			console.log('After search filter:', list.length);
		}
		
		if (this.statusFilter) {
			list = list.filter(t => t.status === this.statusFilter);
			console.log('After status filter:', list.length);
		}
		
		if (this.priorityFilter) {
			list = list.filter(t => t.priority === this.priorityFilter);
			console.log('After priority filter:', list.length);
		}
		
		if (this.typeFilter) {
			list = list.filter(t => String(t.taskType) === this.typeFilter);
			console.log('After type filter:', list.length);
		}
		
		// Team filter removed since we're already fetching by team
		
		this.filtered = list;
		console.log('Final filtered result:', this.filtered.length, 'tasks');
		console.log('Filtered tasks:', this.filtered);
		this.cdr.detectChanges(); // Force change detection after filtering
	}

	toggle(id: number, checked: boolean) {
		if (checked) this.selectedIds.add(id); else this.selectedIds.delete(id);
	}
	toggleAll(checked: boolean) { this.filtered.forEach(t => checked ? this.selectedIds.add(t.id) : this.selectedIds.delete(t.id)); }
	isAllSelected(): boolean { return this.filtered.length>0 && this.filtered.every(t=>this.selectedIds.has(t.id)); }

	assign() {
		if (!this.sprintId || !this.selectedIds.size) return;
		this.assigning = true;
		// Use direct HTTP to avoid potential template type-checking mismatch with service method
		const url = `http://localhost:8080/api/tasks/assign-to-sprint?sprintId=${this.sprintId}`;
		this.http.post<any[]>(url, Array.from(this.selectedIds)).subscribe({
			next: (_response: any) => { this.assigning=false; this.added.emit(Array.from(this.selectedIds)); this.selectedIds.clear(); this.close.emit(); },
			error: (err: any) => { console.error(err); this.assigning=false; this.error='Failed to assign tasks'; }
		});
	}

	closeDialog() { this.close.emit(); }
}
