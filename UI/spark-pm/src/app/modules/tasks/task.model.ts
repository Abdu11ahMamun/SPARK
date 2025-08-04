export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: number;
  reporterId?: number;
  productId?: number;
  moduleId?: number;
  sprintId?: number;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  dueDate?: string;
  createdAt?: string;
  createdDate?: string;
  updatedDate?: string;
  
  // Display properties
  assigneeName?: string;
  reporterName?: string;
  productName?: string;
  moduleName?: string;
  sprintName?: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  TESTING = 'TESTING',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskType {
  FEATURE = 'FEATURE',
  BUG = 'BUG',
  IMPROVEMENT = 'IMPROVEMENT',
  DOCUMENTATION = 'DOCUMENTATION',
  RESEARCH = 'RESEARCH',
  TESTING = 'TESTING'
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: number;
  reporterId?: number;
  productId?: number;
  moduleId?: number;
  sprintId?: number;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: number;
  reporterId?: number;
  productId?: number;
  moduleId?: number;
  sprintId?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface TaskComment {
  id?: number;
  taskId: number;
  userId: number;
  comment: string;
  createdDate?: string;
  
  // Display properties
  userName?: string;
  userAvatar?: string;
}

export interface Sprint {
  id?: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  productId?: number;
  
  // Display properties
  productName?: string;
  taskCount?: number;
  completedTasks?: number;
}

export enum SprintStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
