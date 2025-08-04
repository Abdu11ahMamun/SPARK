import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, ProductSearchFilter } from './product.model';

/**
 * Product Service
 * Provides data management operations for products with backend integration
 * 
 * @author SPARK Team
 * @version 1.0.0
 * @since 2025-08-17
 */

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = '/api/products'; // Adjust to your backend API URL
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all products with optional filtering
   */
  getProducts(filter?: ProductSearchFilter): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.searchTerm) {
        params = params.set('search', filter.searchTerm);
      }
      if (filter.status) {
        params = params.set('status', filter.status);
      }
    }

    return this.http.get<Product[]>(this.baseUrl, { params })
      .pipe(
        map(products => {
          this.productsSubject.next(products);
          return products;
        }),
        catchError(error => {
          console.error('Error fetching products:', error);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Get product by ID
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching product:', error);
          return of(undefined);
        })
      );
  }

  /**
   * Create new product
   */
  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, productData)
      .pipe(
        map(product => {
          // Update local cache
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([...currentProducts, product]);
          return product;
        }),
        catchError(error => {
          console.error('Error creating product:', error);
          throw error;
        })
      );
  }

  /**
   * Update existing product
   */
  updateProduct(id: number, productData: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, productData)
      .pipe(
        map(updatedProduct => {
          // Update local cache
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex(p => p.id === id);
          if (index !== -1) {
            currentProducts[index] = updatedProduct;
            this.productsSubject.next([...currentProducts]);
          }
          return updatedProduct;
        }),
        catchError(error => {
          console.error('Error updating product:', error);
          throw error;
        })
      );
  }

  /**
   * Delete product
   */
  deleteProduct(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => {
          // Update local cache
          const currentProducts = this.productsSubject.value;
          const filteredProducts = currentProducts.filter(p => p.id !== id);
          this.productsSubject.next(filteredProducts);
          return true;
        }),
        catchError(error => {
          console.error('Error deleting product:', error);
          throw error;
        })
      );
  }

  /**
   * Get unique values for filters
   */
  getFilterOptions(): Observable<{
    statuses: string[];
  }> {
    return this.http.get<{
      statuses: string[];
    }>(`${this.baseUrl}/filter-options`)
      .pipe(
        catchError(error => {
          console.error('Error fetching filter options:', error);
          // Return default options on error
          return of({
            statuses: ['ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'MAINTENANCE']
          });
        })
      );
  }

  /**
   * Bulk operations
   */
  bulkDelete(ids: number[]): Observable<boolean> {
    return this.http.post<void>(`${this.baseUrl}/bulk-delete`, { ids })
      .pipe(
        map(() => {
          // Update local cache
          const currentProducts = this.productsSubject.value;
          const filteredProducts = currentProducts.filter(p => !ids.includes(p.id!));
          this.productsSubject.next(filteredProducts);
          return true;
        }),
        catchError(error => {
          console.error('Error bulk deleting products:', error);
          throw error;
        })
      );
  }

  /**
   * Export products
   */
  exportProducts(format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      params: { format },
      responseType: 'blob'
    })
      .pipe(
        catchError(error => {
          console.error('Error exporting products:', error);
          throw error;
        })
      );
  }

  /**
   * Get product statistics
   */
  getProductStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byCategory: { [key: string]: number };
    byOwner: { [key: string]: number };
  }> {
    return this.http.get<any>(`${this.baseUrl}/stats`)
      .pipe(
        catchError(error => {
          console.error('Error fetching product stats:', error);
          return of({
            total: 0,
            active: 0,
            inactive: 0,
            byCategory: {},
            byOwner: {}
          });
        })
      );
  }
}
