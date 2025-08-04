/**
 * Product Model Interface
 * Defines the structure for product data management
 * 
 * @author SPARK Team
 * @version 1.0.0
 * @since 2025-08-17
 */

export interface Product {
  id?: number;
  name: string;
  productOwnerId: number; // User ID from SPARK_USER table
  status: 'ACTIVE' | 'INACTIVE' | 'DEVELOPMENT' | 'MAINTENANCE';
  currentRelease?: string;
  version?: string;
  vision?: string;
  dependentProducts?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Additional computed fields for display
  productOwnerName?: string; // Will be populated from user data
}

export interface ProductFormData {
  name: string;
  productOwnerId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DEVELOPMENT' | 'MAINTENANCE';
  currentRelease: string;
  version: string;
  vision: string;
  dependentProducts: number;
}

export interface ProductSearchFilter {
  searchTerm?: string;
  status?: string;
}
