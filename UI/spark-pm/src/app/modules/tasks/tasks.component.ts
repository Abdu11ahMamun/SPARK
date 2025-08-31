import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TeamService } from '../teams/team.service';
import { Team, TeamMember } from '../teams/team.model';

// Local minimal interfaces to decouple from model file
interface TaskItem {
  id?: number;
  mitsNo: string;
  taskType: string;
  productId?: number; // maps backend productid
  productModuleId?: number;
  title: string;
  description?: string;
  assigneeUserId?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline?: string;
  points?: number;
  teamId?: number;
}
interface ProductOption { id: number; name: string; }
interface ModuleOption { id: number; name: string; productId: number; }
interface UserOption { id: number; firstName?: string; lastName?: string; username: string; }
interface JobTypeOption { id: number; type: string; description?: string; }

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  // Data
  tasks: TaskItem[] = [];
  filtered: TaskItem[] = [];
  filteredTasks: TaskItem[] = []; // Alias for template compatibility
  paginated: TaskItem[] = []; // Alias for template compatibility
  products: ProductOption[] = [];
  modules: ModuleOption[] = [];
  users: UserOption[] = [];
  jobTypes: JobTypeOption[] = [];
  jobTypeOptions: { value: number; label: string }[] = [];
  teams: Team[] = [];
  teamMembers: TeamMember[] = [];
  filteredAssignees: UserOption[] = [];

  // UI state
  isLoading = false;
  isInitialLoad = true;
  error: string | null = null;
  showSearchPanel = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalTasks = 0;
  paginatedTasks: TaskItem[] = [];
  
  get totalPages(): number {
    return Math.ceil(this.totalTasks / this.pageSize);
  }

  // Search filters
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  taskTypeFilter = '';
  productFilter = '';
  moduleFilter = '';
  assigneeFilter = '';
  mitsFilter = '';
  deadlineFrom = '';
  deadlineTo = '';

  // Modal
  isModalOpen = false;
  isDeleteModalOpen = false;
  isEditMode = false;
  isSaving = false;
  selected: TaskItem | null = null;
  form!: FormGroup;
  Math = Math;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private teamService: TeamService
  ) { this.initForm(); }

  ngOnInit(): void { this.load(); }

  private initForm() {
    this.form = this.fb.group({
      mitsNo: ['', Validators.required],
      taskType: ['', Validators.required],
      productId: ['', Validators.required],
      productModuleId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assigneeUserId: [''],
      status: ['OPEN', Validators.required],
      priority: ['MEDIUM', Validators.required],
      deadline: [''],
  points: [0, [Validators.min(0)]],
  teamId: ['']
    });
  }

  private async load() {
    this.isLoading = true; this.error = null;
    try {
      const base = (await import('../../../environments/environment')).environment.apiUrl;
      const [tasks, products, modules, users, jobTypes, teams] = await Promise.all([
        this.http.get<any[]>(`${base}/api/tasks`).toPromise(),
        this.http.get<any[]>(`${base}/api/products`).toPromise(),
        this.http.get<any[]>(`${base}/api/product-modules`).toPromise(),
        this.http.get<any[]>(`${base}/api/users`).toPromise(),
        this.http.get<JobTypeOption[]>(`${base}/api/job-types`).toPromise(),
        this.teamService.getTeams().toPromise()
      ]);
      
      // Map backend field names to frontend interface
      this.tasks = (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: (task.status || 'OPEN').toUpperCase(),
        priority: (task.priority || 'MEDIUM').toUpperCase(),
        deadline: task.deadline || null,
        assigneeUserId: task.assignedto,
        sprintId: task.sprintid,
        productId: task.productid,
        productModuleId: task.productModuleId,
        points: task.points,
        taskType: String(task.taskType || task.tasktypeid || ''),
        mitsNo: task.mitsId ? String(task.mitsId) : (task.id?.toString() || ''),
        teamId: task.teamId
      } as TaskItem)); 
      this.products = products || []; 
      this.modules = modules || []; 
      this.users = users || []; 
      this.jobTypes = jobTypes || [];
      this.teams = teams || [];
      this.filteredAssignees = [...this.users];
      
      // Map job types to dropdown options
      this.jobTypeOptions = this.jobTypes.map(type => ({ 
        value: type.id, 
        label: type.type 
      }));
      
      console.log('Loaded job types:', this.jobTypeOptions);
      console.log('Loaded users:', this.users);
      console.log('Loaded tasks:', this.tasks);
      this.applyFilters();
    } catch (e) { 
      console.error('Error loading data:', e); 
      this.error = 'Failed to load data. Please check if the backend is running.';
      
      // Fallback job types
      this.jobTypeOptions = [
        { value: 1, label: 'Development' },
        { value: 2, label: 'Testing' },
        { value: 3, label: 'Deployment' }
      ];
    }
    finally { 
      this.isLoading = false; 
      this.isInitialLoad = false; 
      this.cdr.detectChanges(); 
    }
  }

  // Filters
  toggleSearchPanel() { this.showSearchPanel = !this.showSearchPanel; }
  onSearchChange() { setTimeout(() => this.applyFilters(), 250); }
  
  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.taskTypeFilter = '';
    this.productFilter = '';
    this.moduleFilter = '';
    this.assigneeFilter = '';
    this.mitsFilter = '';
    this.deadlineFrom = '';
    this.deadlineTo = '';
    this.applyFilters();
  }

  applyFilters() {
    let list = [...this.tasks]; const term = this.searchTerm.toLowerCase();
    if (term) {
      list = list.filter(t =>
        t.mitsNo?.toLowerCase().includes(term) ||
        t.title?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }
    if (this.mitsFilter) {
      list = list.filter(t => t.mitsNo?.toLowerCase().includes(this.mitsFilter.toLowerCase()));
    }
    if (this.statusFilter) list = list.filter(t => t.status === this.statusFilter);
    if (this.priorityFilter) list = list.filter(t => t.priority === this.priorityFilter);
    if (this.taskTypeFilter) {
      list = list.filter(t => this.getJobTypeName(t.taskType) === this.taskTypeFilter);
    }
    if (this.productFilter) list = list.filter(t => t.productId === +this.productFilter);
    if (this.moduleFilter) list = list.filter(t => t.productModuleId === +this.moduleFilter);
    if (this.assigneeFilter) list = list.filter(t => t.assigneeUserId === +this.assigneeFilter);
    if (this.deadlineFrom) list = list.filter(t => t.deadline && t.deadline >= this.deadlineFrom);
    if (this.deadlineTo) list = list.filter(t => t.deadline && t.deadline <= this.deadlineTo);
    this.filtered = list; 
    this.filteredTasks = list; // Sync with template alias
    this.updatePagination();
  }

  onProductChangeForFilter() { this.moduleFilter = ''; }
  onProductChangeInForm() { this.form.patchValue({ productModuleId: '' }); }
  onTeamChangeInForm() { const teamId = this.form.value.teamId; this.loadTeamMembers(teamId); }

  private loadTeamMembers(teamId: number) {
    if (!teamId) { this.teamMembers = []; this.filteredAssignees = [...this.users]; return; }
    this.teamService.getTeamMembers(+teamId).subscribe({
      next: members => {
        this.teamMembers = members || [];
        this.filteredAssignees = this.teamMembers.map(m => ({ id: m.userId, username: m.userName, firstName: m.userName.split(' ')[0], lastName: m.userName.split(' ').slice(1).join(' ') }));
      },
      error: () => { this.teamMembers = []; this.filteredAssignees = [...this.users]; }
    });
  }

  // Template helpers
  getModulesForProduct(productId: string | number | undefined) {
    const pid = typeof productId === 'string' ? +productId : productId;
    if (!pid) return this.modules;
    return this.modules.filter(m => m.productId === pid);
  }
  getProductName(productId?: number): string {
    if (!productId) return '—';
    const p = this.products.find(x => x.id === productId);
    return p?.name || '—';
  }
  getModuleName(moduleId?: number): string {
    if (!moduleId) return '—';
    const m = this.modules.find(x => x.id === moduleId);
    return m?.name || '—';
  }
  getTeamName(teamId?: number): string {
    if (!teamId) return '—';
    const t = this.teams.find(x => x.id === teamId);
    return t?.teamName || '—';
  }

  getJobTypeName(taskType?: string | number): string {
    if (!taskType) return '—';
    // If taskType is already a string (type name), return it
    if (typeof taskType === 'string' && isNaN(Number(taskType))) {
      return taskType;
    }
    // If taskType is an ID, find the corresponding type name
    const jobTypeId = typeof taskType === 'string' ? Number(taskType) : taskType;
    const jobType = this.jobTypes.find(x => x.id === jobTypeId);
    return jobType?.type || '—';
  }

  // Pagination helpers
  private updatePagination() {
    this.totalTasks = this.filtered.length;
    const totalPages = Math.ceil(this.totalTasks / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    this.updatePaginatedTasks();
  }
  
  private updatePaginatedTasks() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTasks = this.filtered.slice(start, start + this.pageSize);
    this.paginated = this.paginatedTasks; // Sync with template alias
  }
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalTasks);
  }

  getVisiblePages(): number[] {
    const pages = [];
    for (let i = 1; i <= Math.ceil(this.totalTasks / this.pageSize); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTasks();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  // CRUD
  addTask() { this.isEditMode = false; this.selected = null; this.form.reset({ status: 'OPEN', priority: 'MEDIUM', points: 0 }); this.isModalOpen = true; }
  editTask(t: TaskItem) {
    this.isEditMode = true; this.selected = t; this.form.patchValue(t); this.isModalOpen = true;
  }
  async saveTask() {
    if (this.isSaving) return; // prevent double submissions
    if (this.form.invalid) { Object.values(this.form.controls).forEach(c => c.markAsTouched()); return; }
    const data: TaskItem = this.form.value;
    
    // Map frontend field names to backend field names
    const backendData: any = {
      id: this.isEditMode ? this.selected?.id : undefined,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      deadline: data.deadline || null,
      assignedto: data.assigneeUserId || null,
      productid: data.productId ? Number(data.productId) : null,
      productModuleId: data.productModuleId ? Number(data.productModuleId) : null,
      points: data.points || 0,
      taskType: typeof data.taskType === 'string' ? Number(data.taskType) : data.taskType,
      tasktypeid: typeof data.taskType === 'string' ? Number(data.taskType) : data.taskType,
      mitsId: data.mitsNo ? Number(data.mitsNo) : null,
      teamId: data.teamId ? Number(data.teamId) : null
    };
    
    try {
      this.isSaving = true;
      const base = (await import('../../../environments/environment')).environment.apiUrl;
      if (this.isEditMode && this.selected?.id) {
        const updated = { ...backendData };
        await this.http.put<any>(`${base}/api/tasks/${this.selected.id}`, updated).toPromise();
        Object.assign(this.selected!, {
          ...data,
          productId: data.productId,
          productModuleId: data.productModuleId,
          assigneeUserId: data.assigneeUserId,
          points: data.points
        });
      } else {
        const created = await this.http.post<any>(`${base}/api/tasks`, backendData as any).toPromise();
        if (created) {
          const mappedTask: TaskItem = {
            id: created.id,
            title: created.title,
            description: created.description,
            status: (created.status || 'OPEN').toUpperCase(),
            priority: (created.priority || 'MEDIUM').toUpperCase(),
            deadline: created.deadline || null,
            assigneeUserId: created.assignedto,
            productId: created.productid,
            productModuleId: created.productModuleId,
            points: created.points,
            taskType: String(created.taskType || created.tasktypeid || ''),
            mitsNo: created.mitsId ? String(created.mitsId) : (created.id?.toString() || ''),
            teamId: created.teamId
          };
          this.tasks.unshift(mappedTask);
        }
      }
      this.applyFilters(); this.closeModal();
    } catch (e) { console.error(e); this.error = 'Failed to save task'; }
    finally { this.isSaving = false; }
  }
  askDelete(t: TaskItem) { this.selected = t; this.isDeleteModalOpen = true; }
  async confirmDelete() {
    if (!this.selected?.id) return; try {
      const base = (await import('../../../environments/environment')).environment.apiUrl;
      await this.http.delete<void>(`${base}/api/tasks/${this.selected.id}`).toPromise();
      this.tasks = this.tasks.filter(x => x.id !== this.selected!.id); this.applyFilters(); this.closeDelete();
    } catch (e) { console.error(e); this.error = 'Failed to delete task'; }
  }

  // Modal helpers
  closeModal() { this.isModalOpen = false; this.isEditMode = false; this.selected = null; }
  closeDelete() { this.isDeleteModalOpen = false; this.selected = null; }

  // View helpers
  getAssigneeName(id?: number): string {
    const pool = this.filteredAssignees.length ? this.filteredAssignees : this.users;
    const u = pool.find(x => x.id === id); if (!u) return '—';
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return full || u.username;
  }

  getAssigneeInitials(id?: number): string {
    const pool = this.filteredAssignees.length ? this.filteredAssignees : this.users;
    const u = pool.find(x => x.id === id);
    if (!u) return '?';
    
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    if (fullName) {
      const parts = fullName.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    
    return u.username ? u.username[0].toUpperCase() : '?';
  }

  isOverdue(deadline?: string): boolean {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  }
}
