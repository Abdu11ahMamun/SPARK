import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../products/product.service';
import { Product, ProductModule } from '../products/product.model';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';

@Component({
  selector: 'app-product-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modules.component.html',
  styleUrls: ['./product-modules.component.scss']
})
export class ProductModulesComponent implements OnInit {
  modules: ProductModule[] = [];
  products: Product[] = [];
  users: User[] = [];
  isLoading = false;
  showForm = false;
  isEditMode = false;
  editingModule: ProductModule | null = null;
  showDeleteConfirm = false;
  moduleToDelete: ProductModule | null = null;
  
  moduleForm: ProductModule = {
    name: '',
    productId: 0,
    release: '',
    moduleStatus: 'Active',
    moduleOwnerId: undefined,
    client: ''
  };

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    console.log('Starting to load modules...');
    this.isLoading = true;
    
    // Load modules first
    this.productService.getAllModules().subscribe({
      next: (modules) => {
        console.log('Modules received:', modules);
        this.modules = modules;
        
        // Load products to get names
        this.productService.getProducts().subscribe({
          next: (products) => {
            this.products = products;
            
            // Load users to get owner names
            this.userService.getUsers().subscribe({
              next: (users) => {
                this.users = users;
                this.updateModuleDisplayNames();
                this.isLoading = false;
                this.cdr.detectChanges();
              },
              error: (error: any) => {
                console.error('Error loading users:', error);
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: (error: any) => {
            console.error('Error loading products:', error);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading modules:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private updateModuleDisplayNames(): void {
    this.modules.forEach(module => {
      // Add product name
      const product = this.products.find(p => p.id === module.productId);
      module.productName = product?.name || 'Unknown Product';
      
      // Add owner name
      const owner = this.users.find(u => u.id === module.moduleOwnerId);
      module.ownerName = owner ? `${owner.firstName} ${owner.lastName}`.trim() : 'Unknown Owner';
    });
  }

  refreshModules(): void {
    if (this.isLoading) return;
    this.loadModules();
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.resetForm();
  }

  hideForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingModule = null;
    this.resetForm();
  }

  resetForm(): void {
    this.moduleForm = {
      name: '',
      productId: 0,
      release: '',
      moduleStatus: 'Active',
      moduleOwnerId: undefined,
      client: ''
    };
  }

  submitForm(): void {
    if (this.isEditMode && this.editingModule) {
      this.updateModule();
    } else {
      this.addModule();
    }
  }

  addModule(): void {
    this.productService.addProductModule(this.moduleForm.productId, this.moduleForm).subscribe({
      next: (module: ProductModule) => {
        this.hideForm();
        this.refreshModules(); // Refresh data instead of manual update
        console.log('Module added successfully');
      },
      error: (error: any) => {
        console.error('Error adding module:', error);
        alert('Error adding module: ' + (error.error?.message || error.message));
      }
    });
  }

  editModule(module: ProductModule): void {
    this.isEditMode = true;
    this.editingModule = module;
    this.moduleForm = { ...module };
    this.showForm = true;
  }

  updateModule(): void {
    if (!this.editingModule?.id) return;
    
    this.productService.updateProductModule(this.moduleForm.productId, this.editingModule.id, this.moduleForm).subscribe({
      next: (updatedModule: ProductModule) => {
        this.hideForm();
        this.refreshModules(); // Refresh data instead of manual update
        console.log('Module updated successfully');
      },
      error: (error: any) => {
        console.error('Error updating module:', error);
        alert('Error updating module: ' + (error.error?.message || error.message));
      }
    });
  }

  confirmDelete(module: ProductModule): void {
    this.moduleToDelete = module;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.moduleToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteModule(): void {
    if (!this.moduleToDelete?.id) return;
    
    this.productService.deleteProductModule(this.moduleToDelete.productId, this.moduleToDelete.id).subscribe({
      next: () => {
        this.cancelDelete();
        this.refreshModules(); // Refresh data instead of manual update
        console.log('Module deleted successfully');
      },
      error: (error: any) => {
        console.error('Error deleting module:', error);
        alert('Error deleting module: ' + (error.error?.message || error.message));
      }
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  }

  getOwnerName(ownerId: number | undefined): string {
    if (!ownerId) return 'No Owner';
    const owner = this.users.find(u => u.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}`.trim() : 'Unknown Owner';
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'completed': return 'status-production';
      case 'in-progress': return 'status-development';
      case 'development': return 'status-development';
      case 'testing': return 'status-testing';
      case 'maintenance': return 'status-maintenance';
      case 'deprecated': return 'status-deprecated';
      case 'pending': return 'status-pending';
      default: return 'status-inactive';
    }
  }

  trackByModuleId(index: number, module: ProductModule): number {
    return module.id || index;
  }
}
