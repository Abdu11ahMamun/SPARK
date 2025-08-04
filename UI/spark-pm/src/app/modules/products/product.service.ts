import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductModule, CreateProductRequest, UpdateProductRequest, CreateProductModuleRequest, UpdateProductModuleRequest } from './product.model';
import { environment } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.apiBaseUrl + '/products';

  constructor(private http: HttpClient) {}

  // Product CRUD operations
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Product Module operations
  getProductModules(productId: number): Observable<ProductModule[]> {
    return this.http.get<ProductModule[]>(`${this.apiUrl}/${productId}/modules`);
  }

  // Get all modules across all products
  getAllModules(): Observable<ProductModule[]> {
    return this.http.get<ProductModule[]>(`${this.apiUrl}/modules`);
  }

  addProductModule(productId: number, module: Partial<ProductModule>): Observable<ProductModule> {
    return this.http.post<ProductModule>(`${this.apiUrl}/${productId}/modules`, module);
  }

  updateProductModule(productId: number, moduleId: number, module: Partial<ProductModule>): Observable<ProductModule> {
    return this.http.put<ProductModule>(`${this.apiUrl}/${productId}/modules/${moduleId}`, module);
  }

  deleteProductModule(productId: number, moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/modules/${moduleId}`);
  }

  // Search and filter operations
  getProductsByStatus(status: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/status/${status}`);
  }

  getProductsByOwner(ownerId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }
}
