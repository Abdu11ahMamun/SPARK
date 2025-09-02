export interface User {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  password?: string;
  email: string;
  phone?: string;
  employeeId?: string;
  role: UserRole;
  activeStatus?: UserStatus;
  createdate?: string;
  updatedate?: string;
  fullName?: string; // Computed field
  teamMemberships?: TeamMembership[];
}

export interface CreateUserRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  employeeId?: string;
  role: UserRole;
  activeStatus?: UserStatus;
}

export interface UpdateUserRequest {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  employeeId?: string;
  role: UserRole;
  activeStatus?: UserStatus;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  TESTER = 'TESTER',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  DEVOPS = 'DEVOPS',
  PRODUCT_OWNER = 'PRODUCT_OWNER',
  GUEST = 'GUEST',
  SCRUM_MASTER = 'SCRUM_MASTER',
  SUPPORT = 'SUPPORT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface TeamMembership {
  teamId: number;
  teamName: string;
  role: string;
}
