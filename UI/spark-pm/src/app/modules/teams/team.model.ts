export interface Team {
  id: number;
  teamName: string;  // Changed from 'name' to 'teamName'
  description: string;
  status: number;    // Changed from string to number
  pOwner?: number;   // Product Owner (corresponds to leadId)
  sMaster?: number;  // Scrum Master
  createdAt: string; // Changed from 'createdDate'
  updatedAt?: string; // Changed from 'updatedDate'
  
  // Display properties (computed from other data)
  leadName?: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  userName: string;
  userEmail: string;
  role: 'member' | 'lead' | 'admin';
  joinedDate: string;
}

export interface CreateTeamRequest {
  teamName: string;  // Changed from 'name' to 'teamName'
  description: string;
  status: number;    // Changed from string to number
  pOwner?: number;   // Changed from 'leadId' to 'pOwner'
  sMaster?: number;  // Added sMaster field
}

export interface UpdateTeamRequest extends CreateTeamRequest {
  id: number;
}

// Status constants
export const TeamStatus = {
  ACTIVE: 1,
  INACTIVE: 0,
  COMPLETED: 2
} as const;
