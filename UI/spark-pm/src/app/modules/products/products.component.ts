import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Product {
  id?: number;
  name: string;
  version?: string;
  status: string;
  currentRelease?: string;
  vision?: string;
  productOwnerId: number;
  dependentProducts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  // Data properties
  products: Product[] = [];
  filteredProducts: Product[] = [];
  users: User[] = [];
  
  // State properties
  isLoading = false;
  isInitialLoad = true;
  error: string | null = null;
  
  // Modal properties
  isModalOpen = false;
  isDeleteModalOpen = false;
  isEditMode = false;
  selectedProduct: Product | null = null;
  
  // Search and filter properties
  showSearchPanel = false;
  searchTerm = '';
  statusFilter = '';
  userFilter = '';
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  paginatedProducts: Product[] = [];
  
  // Form
  productForm!: FormGroup;
  
  // Math reference for template
  Math = Math;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      productOwnerId: ['', Validators.required],
      status: ['ACTIVE'],
      currentRelease: [''],
      version: [''],
      vision: [''],
      dependentProducts: [0, [Validators.min(0)]]
    });
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Load users and products in parallel
      const [usersResponse, productsResponse] = await Promise.all([
        this.http.get<User[]>(`${environment.apiUrl}/api/users`).toPromise(),
        this.http.get<Product[]>(`${environment.apiUrl}/api/products`).toPromise()
      ]);
      
      this.users = usersResponse || [];
      this.products = productsResponse || [];
      this.applyFilters();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = 'Failed to load data. Please try again.';
      this.products = [];
      this.users = [];
    } finally {
      this.isLoading = false;
      this.isInitialLoad = false;
      this.cdr.detectChanges();
    }
  }

  // Search and Filter Methods
  toggleSearchPanel(): void {
    this.showSearchPanel = !this.showSearchPanel;
  }

  onSearchChange(): void {
    // Debounce search
    setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.version && product.version.toLowerCase().includes(term)) ||
        (product.currentRelease && product.currentRelease.toLowerCase().includes(term)) ||
        (product.vision && product.vision.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(product => product.status === this.statusFilter);
    }

    // Apply user filter
    if (this.userFilter) {
      filtered = filtered.filter(product => product.productOwnerId === +this.userFilter);
    }

    this.filteredProducts = filtered;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.userFilter = '';
    this.applyFilters();
  }

  // Pagination Methods
  private updatePagination(): void {
    this.totalItems = this.filteredProducts.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Reset to first page if current page is beyond available pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    this.updatePaginatedProducts();
  }

  private updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProducts();
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // CRUD Methods
  async refreshProducts(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.http.get<Product[]>(`${environment.apiUrl}/api/products`).toPromise();
      this.products = response || [];
      this.applyFilters();
    } catch (error) {
      console.error('Error refreshing products:', error);
      this.error = 'Failed to refresh products. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  addProduct(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset({
      status: 'ACTIVE',
      dependentProducts: 0
    });
    this.isModalOpen = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue({
      name: product.name,
      productOwnerId: product.productOwnerId,
      status: product.status,
      currentRelease: product.currentRelease || '',
      version: product.version || '',
      vision: product.vision || '',
      dependentProducts: product.dependentProducts || 0
    });
    this.isModalOpen = true;
  }

  async saveProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    const formData = this.productForm.value;
    
    try {
      if (this.isEditMode && this.selectedProduct) {
        // Update existing product
        const updatedProduct = { ...this.selectedProduct, ...formData };
        await this.http.put<Product>(`${environment.apiUrl}/api/products/${this.selectedProduct.id}`, updatedProduct).toPromise();
        
        // Update local array
        const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
      } else {
        // Create new product
        const newProduct = await this.http.post<Product>(`${environment.apiUrl}/api/products`, formData).toPromise();
        if (newProduct) {
          this.products.push(newProduct);
        }
      }
      
      this.applyFilters();
      this.closeModal();
      
    } catch (error) {
      console.error('Error saving product:', error);
      this.error = 'Failed to save product. Please try again.';
    }
  }

  deleteProduct(product: Product): void {
    this.selectedProduct = product;
    this.isDeleteModalOpen = true;
  }

  async confirmDelete(): Promise<void> {
    if (!this.selectedProduct) return;

    try {
      await this.http.delete(`${environment.apiUrl}/api/products/${this.selectedProduct.id}`).toPromise();
      
      // Remove from local array
      this.products = this.products.filter(p => p.id !== this.selectedProduct!.id);
      this.applyFilters();
      this.closeDeleteModal();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      this.error = 'Failed to delete product. Please try again.';
    }
  }

  // Modal Methods
  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedProduct = null;
  }

  // Utility Methods
  trackByProductId(index: number, product: Product): any {
    return product.id;
  }

  getProductOwnerName(ownerId: number): string {
    const owner = this.users.find(user => user.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'DEVELOPMENT':
        return 'status-development';
      case 'MAINTENANCE':
        return 'status-maintenance';
      default:
        return 'status-default';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}