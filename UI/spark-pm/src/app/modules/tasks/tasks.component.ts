import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Local minimal interfaces to decouple from model file
interface TaskItem {
  id?: number;
  mitsNo: string;
  taskType: string;
  productId?: number;
  productModuleId?: number;
  title: string;
  description?: string;
  assigneeUserId?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline?: string;
  points?: number;
}
interface ProductOption { id: number; name: string; }
interface ModuleOption { id: number; name: string; productId: number; }
interface UserOption { id: number; firstName?: string; lastName?: string; username: string; }

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

  // UI state
  isLoading = false;
  isInitialLoad = true;
  error: string | null = null;
  showSearchPanel = true;

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
  selected: TaskItem | null = null;
  form!: FormGroup;
  Math = Math;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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
      points: [0, [Validators.min(0)]]
    });
  }

  private async load() {
    this.isLoading = true; this.error = null;
    try {
      const base = (await import('../../../environments/environment')).environment.apiUrl;
      const [tasks, products, modules, users] = await Promise.all([
        this.http.get<any[]>(`${base}/api/tasks`).toPromise(),
        this.http.get<any[]>(`${base}/api/products`).toPromise(),
        this.http.get<any[]>(`${base}/api/product-modules`).toPromise(),
        this.http.get<any[]>(`${base}/api/users`).toPromise()
      ]);
      this.tasks = tasks || []; this.products = products || []; this.modules = modules || []; this.users = users || [];
      this.applyFilters();
    } catch (e) { console.error(e); this.error = 'Failed to load tasks'; }
    finally { this.isLoading = false; this.isInitialLoad = false; this.cdr.detectChanges(); }
  }

  // Filters
  toggleSearchPanel() { this.showSearchPanel = !this.showSearchPanel; }
  onSearchChange() { setTimeout(() => this.applyFilters(), 250); }
  clearFilters() {
    this.searchTerm = this.statusFilter = this.priorityFilter = this.productFilter = this.moduleFilter = this.assigneeFilter = this.mitsFilter = '';
    this.deadlineFrom = this.deadlineTo = '';
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
    if (this.form.invalid) { Object.values(this.form.controls).forEach(c => c.markAsTouched()); return; }
    const data: TaskItem = this.form.value;
    try {
      const base = (await import('../../../environments/environment')).environment.apiUrl;
      if (this.isEditMode && this.selected?.id) {
        const updated = { ...this.selected, ...data } as any;
        await this.http.put<void>(`${base}/api/tasks/${this.selected.id}`, updated).toPromise();
        Object.assign(this.selected, data);
      } else {
        const created = await this.http.post<any>(`${base}/api/tasks`, data as any).toPromise(); if (created) this.tasks.unshift(created);
      }
      this.applyFilters(); this.closeModal();
    } catch (e) { console.error(e); this.error = 'Failed to save task'; }
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
    const u = this.users.find(x => x.id === id); if (!u) return '—';
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return full || u.username;
  }
}
