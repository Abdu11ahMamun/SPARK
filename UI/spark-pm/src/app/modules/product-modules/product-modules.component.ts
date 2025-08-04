import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ProductSummary { id: number; name: string; }

interface ProductModule {
  id?: number;
  name: string;
  status: string;
  currentRelease?: string;
  version?: string;
  vision?: string;
  productId: number; // relation to Product
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-product-modules',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-modules.component.html',
  styleUrls: ['./product-modules.component.scss']
})
export class ProductModulesComponent implements OnInit {
  // Data
  modules: ProductModule[] = [];
  filteredModules: ProductModule[] = [];
  products: ProductSummary[] = [];

  // State
  isLoading = false;
  isInitialLoad = true;
  error: string | null = null;

  // Modal
  isModalOpen = false;
  isDeleteModalOpen = false;
  isEditMode = false;
  selectedModule: ProductModule | null = null;

  // Filters
  showSearchPanel = false;
  searchTerm = '';
  statusFilter = '';
  productFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalModules = 0;
  paginatedModules: ProductModule[] = [];

  // Form
  moduleForm!: FormGroup;
  Math = Math;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  // Additional pagination properties and methods
  get totalPages(): number {
    return Math.ceil(this.totalModules / this.pageSize);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalModules);
  }

  getVisiblePages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedModules();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.moduleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      productId: ['', Validators.required],
      status: ['ACTIVE'],
      currentRelease: [''],
      version: [''],
      vision: ['']
    });
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      const [productsRes, modulesRes] = await Promise.all([
        this.http.get<ProductSummary[]>(`${environment.apiUrl}/api/products`).toPromise(),
        this.http.get<ProductModule[]>(`${environment.apiUrl}/api/product-modules`).toPromise()
      ]);
      this.products = productsRes || [];
      this.modules = modulesRes || [];
      this.applyFilters();
    } catch (err) {
      console.error('Error loading modules/products', err);
      this.error = 'Failed to load modules. Please try again.';
      this.modules = [];
      this.products = [];
    } finally {
      this.isLoading = false;
      this.isInitialLoad = false;
      this.cdr.detectChanges();
    }
  }

  // Filters
  toggleSearchPanel(): void { this.showSearchPanel = !this.showSearchPanel; }
  onSearchChange(): void { setTimeout(() => this.applyFilters(), 250); }
  clearFilters(): void { this.searchTerm = this.statusFilter = this.productFilter = ''; this.applyFilters(); }

  applyFilters(): void {
    let filtered = [...this.modules];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        (m.version && m.version.toLowerCase().includes(term)) ||
        (m.currentRelease && m.currentRelease.toLowerCase().includes(term)) ||
        (m.vision && m.vision.toLowerCase().includes(term))
      );
    }
    if (this.statusFilter) {
      filtered = filtered.filter(m => m.status === this.statusFilter);
    }
    if (this.productFilter) {
      filtered = filtered.filter(m => m.productId === +this.productFilter);
    }
    this.filteredModules = filtered;
    this.updatePagination();
  }

  // Pagination
  private updatePagination(): void {
    this.totalModules = this.filteredModules.length;
    if (this.currentPage > this.totalModules && this.totalModules > 0) this.currentPage = 1;
    this.updatePaginatedModules();
  }
  private updatePaginatedModules(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedModules = this.filteredModules.slice(start, start + this.pageSize);
  }
  goToFirstPage(): void { this.goToPage(1); }
  goToLastPage(): void { this.goToPage(Math.ceil(this.totalModules / this.pageSize)); }
  goToPreviousPage(): void { this.goToPage(this.currentPage - 1); }
  goToNextPage(): void { this.goToPage(this.currentPage + 1); }
  getPageNumbers(): number[] {
    const pages: number[] = []; const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(Math.ceil(this.totalModules / this.pageSize), start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // CRUD
  async refreshModules(): Promise<void> {
    if (this.isLoading) return; this.isLoading = true; this.error = null;
    try {
      const res = await this.http.get<ProductModule[]>(`${environment.apiUrl}/api/product-modules`).toPromise();
      this.modules = res || [];
      this.applyFilters();
    } catch (e) {
      console.error('Error refreshing modules', e); this.error = 'Failed to refresh modules.';
    } finally { this.isLoading = false; this.cdr.detectChanges(); }
  }

  addModule(): void {
    this.isEditMode = false; this.selectedModule = null; this.moduleForm.reset({ status: 'ACTIVE' }); this.isModalOpen = true;
  }
  editModule(m: ProductModule): void {
    this.isEditMode = true; this.selectedModule = m;
    this.moduleForm.patchValue({
      name: m.name,
      productId: m.productId,
      status: m.status,
      currentRelease: m.currentRelease || '',
      version: m.version || '',
      vision: m.vision || ''
    });
    this.isModalOpen = true;
  }
  async saveModule(): Promise<void> {
    if (this.moduleForm.invalid) { this.markFormGroupTouched(this.moduleForm); return; }
    const data = this.moduleForm.value;
    try {
      if (this.isEditMode && this.selectedModule) {
        const updated = { ...this.selectedModule, ...data };
        await this.http.put(`${environment.apiUrl}/api/product-modules/${this.selectedModule.id}`, updated).toPromise();
        const idx = this.modules.findIndex(x => x.id === this.selectedModule!.id); if (idx !== -1) this.modules[idx] = updated;
      } else {
        const created = await this.http.post<ProductModule>(`${environment.apiUrl}/api/product-modules`, data).toPromise();
        if (created) this.modules.push(created);
      }
      this.applyFilters(); this.closeModal();
    } catch (e) { console.error('Error saving module', e); this.error = 'Failed to save module.'; }
  }
  deleteModule(m: ProductModule): void { this.selectedModule = m; this.isDeleteModalOpen = true; }
  async confirmDelete(): Promise<void> {
    if (!this.selectedModule) return;
    try {
      await this.http.delete(`${environment.apiUrl}/api/product-modules/${this.selectedModule.id}`).toPromise();
      this.modules = this.modules.filter(x => x.id !== this.selectedModule!.id);
      this.applyFilters(); this.closeDeleteModal();
    } catch (e) { console.error('Error deleting module', e); this.error = 'Failed to delete module.'; }
  }

  // Modal helpers
  closeModal(): void { this.isModalOpen = false; this.isEditMode = false; this.selectedModule = null; this.moduleForm.reset(); }
  closeDeleteModal(): void { this.isDeleteModalOpen = false; this.selectedModule = null; }

  // Utils
  trackByModuleId(i: number, m: ProductModule) { return m.id; }
  getProductName(productId: number): string {
    return this.products.find(p => p.id === productId)?.name || 'Unknown';
  }
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'DEVELOPMENT': return 'status-development';
      case 'MAINTENANCE': return 'status-maintenance';
      default: return 'status-default';
    }
  }
  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    try { const d = new Date(dateString); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return '—'; }
  }
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(k => formGroup.get(k)?.markAsTouched());
  }

  loadModules(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.filteredModules = this.modules;
      this.totalModules = this.filteredModules.length;
      const start = (this.currentPage - 1) * this.pageSize;
      this.paginatedModules = this.filteredModules.slice(start, start + this.pageSize);
      this.isLoading = false;
    }, 500);
  }
}
