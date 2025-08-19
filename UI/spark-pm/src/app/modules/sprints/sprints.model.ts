export interface Sprint {
  id?: number;
  sprintName: string;
  noOfHolidays: number;
  fromDate: string; // ISO date string
  toDate: string;   // ISO date string
  tramId: number;   // Team ID (keeping original field name used elsewhere)
  sprintPoint: number;
  sprintArchive?: number;
  detailsRemark?: string;
  createBy?: string;
  createTime?: string;
  status: number; // 0=Planning, 1=Active, 2=Completed, 3=Cancelled
  comments?: string | null;
  sprintOutcome?: string | null;
}

export interface SprintFormData {
  sprintName: string;
  noOfHolidays: number;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  detailsRemark?: string;
  status: number;
}

// Enhanced interfaces for Sprint Capacity Management

export interface SprintUserCapacity {
  id?: number;
  sprintId: number;
  userId: number;
  userName: string;
  userCapacityPercentage: number;
  leaveDays: number;
  dailyWorkingHours: number;
  totalWorkingHours: number;
  availableWorkingHours: number;
  allocatedHours: number;
  remainingHours: number;
  status: number;
  notes?: string;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
  utilizationPercentage: number;
  isOverAllocated: boolean;
  workingDays?: number;
}

export interface SprintCapacitySummary {
  totalTeamMembers: number;
  activeMembers: number;
  membersOnLeave: number;
  totalCapacityHours: number;
  totalAllocatedHours: number;
  totalRemainingHours: number;
  averageUtilization: number;
  totalPotentialHours: number;
  totalLostHoursToLeave: number;
  totalLostHoursToCapacity: number;
  totalLeaveDays: number;
  teamEfficiency: number;
  overAllocatedMembers: number;
  underUtilizedMembers: number;
  hasCapacityRisks: boolean;
  sprintDurationDays: number;
  workingDays: number;
  holidays: number;
}

export interface SprintCreation {
  // Basic Sprint Information
  sprintName: string;
  fromDate: string;
  toDate: string;
  tramId: number;
  sprintPoint: number;
  detailsRemark?: string;
  createBy: string;
  noOfHolidays: number;
  
  // Sprint Duration
  sprintDurationDays?: number;
  defaultDailyHours?: number;
  
  // User Capacity Information
  userCapacities: SprintUserCapacity[];
  
  // Sprint Summary
  capacitySummary?: SprintCapacitySummary;
}

export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email?: string;
  phone?: string;
  // Add other user properties as needed
}

export interface SprintStatus {
  id: number;
  name: string;
  description: string;
  color: string;
}

export const SPRINT_STATUSES: SprintStatus[] = [
  { id: 0, name: 'Planning', description: 'Sprint is being planned', color: 'orange' },
  { id: 1, name: 'Active', description: 'Sprint is currently active', color: 'green' },
  { id: 2, name: 'Completed', description: 'Sprint has been completed', color: 'blue' },
  { id: 3, name: 'Cancelled', description: 'Sprint has been cancelled', color: 'red' }
];

export interface CapacityDialogData {
  sprintId?: number;
  sprintName: string;
  sprintDurationDays: number;
  teamId: number;
  userCapacities: SprintUserCapacity[];
  defaultDailyHours: number;
}
