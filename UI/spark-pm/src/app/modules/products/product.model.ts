export interface Product {
  id?: number;
  name: string;
  status: string;
  vision?: string;
  version: string;
  currentRelease?: string;
  productOwnerId?: number;
  dependentProducts?: number;
  client?: string;
  
  // Display properties
  ownerName?: string;
  modules?: ProductModule[];
}

export interface ProductModule {
  id?: number;
  name: string;
  productId: number;
  release?: string;
  moduleStatus: string;
  moduleOwnerId?: number;
  client?: string;
  
  // Display properties
  ownerName?: string;
  productName?: string;
}

export interface CreateProductRequest {
  name: string;
  status: string;
  vision?: string;
  version: string;
  currentRelease?: string;
  productOwnerId?: number;
  dependentProducts?: number;
  client?: string;
}

export interface UpdateProductRequest {
  id: number;
  name: string;
  status: string;
  vision?: string;
  version: string;
  currentRelease?: string;
  productOwnerId?: number;
  dependentProducts?: number;
  client?: string;
}

export interface CreateProductModuleRequest {
  name: string;
  productId: number;
  release?: string;
  moduleStatus: string;
  moduleOwnerId?: number;
  client?: number;
}

export interface UpdateProductModuleRequest {
  id: number;
  name: string;
  productId: number;
  release?: string;
  moduleStatus: string;
  moduleOwnerId?: number;
  client?: number;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEVELOPMENT = 'DEVELOPMENT',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED'
}

export enum ModuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  PRODUCTION = 'PRODUCTION'
}
