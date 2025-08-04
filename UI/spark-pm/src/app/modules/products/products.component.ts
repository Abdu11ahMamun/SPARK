import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductModule, CreateProductRequest, UpdateProductRequest, CreateProductModuleRequest, ProductStatus, ModuleStatus } from './product.model';
import { ProductService } from './product.service';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  users: User[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productModules: ProductModule[] = [];
  isAdd = false;
  isEdit = false;
  isLoading = false;
  error: string | null = null;
  showDeleteConfirm = false;
  productToDelete: Product | null = null;
  showSearchPanel = false;
  showModuleModal = false;
  
  // Module management
  isEditingModule = false;
  editingModule: ProductModule | null = null;
  showDeleteModuleConfirm = false;
  moduleToDelete: ProductModule | null = null;

  // Search and filter
  searchTerm = '';
  selectedStatus = '';
  selectedOwner = '';
  versionFilter = '';
  clientFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalProducts = 0;
  totalPages = 0;

  // Form data
  productForm: CreateProductRequest = {
    name: '',
    status: ProductStatus.DEVELOPMENT,
    vision: '',
    version: '',
    currentRelease: '',
    productOwnerId: undefined,
    dependentProducts: undefined,
    client: ''
  };

  // Module form data
  newModuleForm = {
    name: '',
    release: '',
    moduleStatus: ModuleStatus.DEVELOPMENT as ModuleStatus,
    moduleOwnerId: undefined as number | undefined,
    client: undefined as string | undefined
  };

  // Enums for template
  ProductStatus = ProductStatus;
  ModuleStatus = ModuleStatus;

  // Math for template
  Math = Math;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadUsers();
  }

  loadProducts() {
    if (this.isLoading) return;
    
    console.log('Starting to load products...');
    this.isLoading = true;
    this.error = null;
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products received:', products);
        this.products = products;
        this.updatePagination();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          console.log('Users loaded:', users.length);
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notificationService.error('Error', 'Failed to load users. Please refresh the page.');
          reject(error);
        }
      });
    });
  }

  loadProductModules(productId: number) {
    this.productService.getProductModules(productId).subscribe({
      next: (modules) => {
        this.productModules = modules;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading product modules:', error);
        this.notificationService.error('Error', 'Failed to load product modules.');
      }
    });
  }

  refreshProducts() {
    this.loadProducts();
    this.notificationService.success('Success', 'Products refreshed successfully');
  }

  toggleSearchPanel() {
    this.showSearchPanel = !this.showSearchPanel;
  }

  updatePagination() {
    this.totalProducts = this.products.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  applyFilters() {
    let filtered = [...this.products];

    // Apply search term filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.client?.toLowerCase().includes(searchLower) ||
        product.version.toLowerCase().includes(searchLower) ||
        product.currentRelease?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }

    // Apply owner filter
    if (this.selectedOwner) {
      filtered = filtered.filter(product => product.productOwnerId?.toString() === this.selectedOwner);
    }

    // Apply version filter
    if (this.versionFilter.trim()) {
      const versionLower = this.versionFilter.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.version.toLowerCase().includes(versionLower)
      );
    }

    // Apply client filter
    if (this.clientFilter.trim()) {
      const clientLower = this.clientFilter.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.client?.toLowerCase().includes(clientLower)
      );
    }

    this.filteredProducts = filtered;
    this.updatePagination();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedOwner = '';
    this.versionFilter = '';
    this.clientFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  getPaginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  // Pagination methods
  goToFirstPage() { this.currentPage = 1; }
  goToPreviousPage() { if (this.currentPage > 1) this.currentPage--; }
  goToNextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToLastPage() { this.currentPage = this.totalPages; }
  goToPage(page: number) { this.currentPage = page; }

  getPageNumbers(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  changePageSize() {
    this.currentPage = 1;
    this.updatePagination();
  }

  // CRUD Operations
  addProduct() {
    this.isAdd = true;
    this.isEdit = false;
    this.selectedProduct = null;
    this.resetForm();
  }

  editProduct(product: Product) {
    this.isEdit = true;
    this.isAdd = false;
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      status: product.status,
      vision: product.vision || '',
      version: product.version,
      currentRelease: product.currentRelease || '',
      productOwnerId: product.productOwnerId,
      dependentProducts: product.dependentProducts,
      client: product.client || ''
    };
    this.error = null;
  }

  saveProduct() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;

    if (this.isAdd) {
      this.productService.createProduct(this.productForm).subscribe({
        next: (product) => {
          this.products.push(product);
          this.applyFilters();
          this.notificationService.success('Success', 'Product created successfully');
          this.cancel();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = 'Failed to create product. Please try again.';
          this.isLoading = false;
          console.error('Error creating product:', error);
          this.cdr.detectChanges();
        }
      });
    } else if (this.isEdit && this.selectedProduct) {
      const updateRequest: UpdateProductRequest = {
        ...this.productForm,
        id: this.selectedProduct.id!
      };

      this.productService.updateProduct(updateRequest).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
            this.applyFilters();
          }
          this.notificationService.success('Success', 'Product updated successfully');
          this.cancel();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = 'Failed to update product. Please try again.';
          this.isLoading = false;
          console.error('Error updating product:', error);
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDeleteProduct(product: Product) {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  deleteProduct() {
    if (!this.productToDelete) return;

    this.isLoading = true;
    this.productService.deleteProduct(this.productToDelete.id!).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.productToDelete!.id);
        this.applyFilters();
        this.notificationService.success('Success', 'Product deleted successfully');
        this.showDeleteConfirm = false;
        this.productToDelete = null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to delete product. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error deleting product:', error);
      }
    });
  }

  // Product Module Operations
  viewProductModules(product: Product) {
    this.selectedProduct = product;
    this.loadProductModules(product.id!);
    this.showModuleModal = true;
    this.cancelModuleEdit(); // Reset any editing state
  }

  addProductModule() {
    if (!this.selectedProduct || !this.newModuleForm.name) return;

    this.isLoading = true;
    const moduleRequest = {
      name: this.newModuleForm.name,
      release: this.newModuleForm.release,
      moduleStatus: this.newModuleForm.moduleStatus,
      moduleOwnerId: this.newModuleForm.moduleOwnerId,
      client: this.newModuleForm.client
    };

    this.productService.addProductModule(this.selectedProduct.id!, moduleRequest).subscribe({
      next: (module) => {
        this.productModules.push(module);
        this.resetModuleForm();
        this.notificationService.success('Success', 'Product module added successfully!');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding product module:', error);
        this.notificationService.error('Error', 'Failed to add product module. Please try again.');
      }
    });
  }

  editProductModule(module: ProductModule) {
    this.isEditingModule = true;
    this.editingModule = module;
    this.newModuleForm = {
      name: module.name,
      release: module.release || '',
      moduleStatus: module.moduleStatus as ModuleStatus,
      moduleOwnerId: module.moduleOwnerId,
      client: module.client
    };
  }

  updateProductModule() {
    if (!this.selectedProduct || !this.editingModule || !this.newModuleForm.name) return;

    this.isLoading = true;
    const moduleRequest = {
      name: this.newModuleForm.name,
      release: this.newModuleForm.release,
      moduleStatus: this.newModuleForm.moduleStatus,
      moduleOwnerId: this.newModuleForm.moduleOwnerId,
      client: this.newModuleForm.client
    };

    this.productService.updateProductModule(this.selectedProduct.id!, this.editingModule.id!, moduleRequest).subscribe({
      next: (updatedModule) => {
        const index = this.productModules.findIndex(m => m.id === this.editingModule!.id);
        if (index !== -1) {
          this.productModules[index] = updatedModule;
        }
        this.cancelModuleEdit();
        this.notificationService.success('Success', 'Product module updated successfully!');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating product module:', error);
        this.notificationService.error('Error', 'Failed to update product module. Please try again.');
      }
    });
  }

  confirmDeleteModule(module: ProductModule) {
    this.moduleToDelete = module;
    this.showDeleteModuleConfirm = true;
  }

  removeProductModule() {
    if (!this.selectedProduct || !this.moduleToDelete) return;

    this.isLoading = true;
    this.productService.deleteProductModule(this.selectedProduct.id!, this.moduleToDelete.id!).subscribe({
      next: () => {
        this.productModules = this.productModules.filter(m => m.id !== this.moduleToDelete!.id);
        this.showDeleteModuleConfirm = false;
        this.moduleToDelete = null;
        this.notificationService.success('Success', 'Product module removed successfully!');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error removing product module:', error);
        this.notificationService.error('Error', 'Failed to remove product module. Please try again.');
      }
    });
  }

  cancelModuleEdit() {
    this.isEditingModule = false;
    this.editingModule = null;
    this.resetModuleForm();
  }

  resetModuleForm() {
    this.newModuleForm = {
      name: '',
      release: '',
      moduleStatus: ModuleStatus.DEVELOPMENT as ModuleStatus,
      moduleOwnerId: undefined as number | undefined,
      client: undefined as string | undefined
    };
  }

  // Helper methods
  cancel() {
    this.isAdd = false;
    this.isEdit = false;
    this.selectedProduct = null;
    this.resetForm();
    this.error = null;
  }

  resetForm() {
    this.productForm = {
      name: '',
      status: ProductStatus.DEVELOPMENT,
      vision: '',
      version: '',
      currentRelease: '',
      productOwnerId: undefined,
      dependentProducts: undefined,
      client: ''
    };
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case ProductStatus.ACTIVE: return 'status-active';
      case ProductStatus.INACTIVE: return 'status-inactive';
      case ProductStatus.DEVELOPMENT: return 'status-development';
      case ProductStatus.MAINTENANCE: return 'status-maintenance';
      case ProductStatus.DEPRECATED: return 'status-deprecated';
      default: return 'status-unknown';
    }
  }

  getStatusDisplayName(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  getOwnerName(ownerId?: number): string {
    if (!ownerId) return 'Unassigned';
    const user = this.users.find(u => u.id === ownerId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
}
