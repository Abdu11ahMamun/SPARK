import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest, TeamStatus } from './team.model';
import { TeamService } from './team.service';
import { UserService } from '../users/user.service';
import { User, UserRole } from '../users/user.model';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.new.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  users: User[] = [];
  selectedTeam: Team | null = null;
  teamMembers: TeamMember[] = [];
  isAdd = false;
  isEdit = false;
  isLoading = false;
  error: string | null = null;
  showMemberModal = false;
  showDeleteConfirm = false;
  teamToDelete: Team | null = null;

  // UI state (Jira-like enhancements)
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  viewMode: 'grid' | 'table' = 'grid';
  memberSearchTerm: string = '';

  get filteredTeamMembers(): TeamMember[] {
    if (!this.memberSearchTerm) return this.teamMembers;
    const q = this.memberSearchTerm.toLowerCase();
    return this.teamMembers.filter(m =>
      m.userName?.toLowerCase().includes(q) ||
      m.userEmail?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    );
  }

  // Users not yet part of the selected team (for add form)
  get availableUsersForAdd(): User[] {
    if (!this.selectedTeam) return this.users;
    const memberIds = new Set(this.teamMembers.map(m => m.userId));
  return this.users.filter(u => typeof u.id === 'number' && !memberIds.has(u.id!));
  }

  get filteredTeams(): Team[] {
    return this.teams
      .filter(t => {
        if (!this.searchTerm) return true;
        const q = this.searchTerm.toLowerCase();
        return (
          t.teamName?.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q))
        );
      })
      .filter(t => {
        if (this.statusFilter === 'ALL') return true;
        // status numeric mapping: 1 active, 0 inactive, 2 completed (as seen earlier)
        return String(t.status) === this.statusFilter;
      });
  }

  // Form data
  teamForm: CreateTeamRequest = {
    teamName: '',
    description: '',
    pOwner: undefined,
    sMaster: undefined,
    status: TeamStatus.ACTIVE
  };

  // Member form
  newMemberForm = {
    userId: 0,
    role: 'member'
  };

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Initial parallel loading of users and teams
    this.isLoading = true;
    Promise.all([this.loadUsers(), this.loadTeams()])
      .catch(err => console.error('Initialization error:', err))
      .finally(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private loadTeams(): Promise<void> {
    return new Promise((resolve) => {
      this.teamService.getTeams().subscribe({
        next: (teams) => {
          this.teams = teams;
          // For each team load members (lightweight approach; could be optimized later)
          this.teams.forEach(team => {
            this.teamService.getTeamMembers(team.id).subscribe({
              next: members => {
                team.members = members;
                // If currently selected team, sync members array
                if (this.selectedTeam && this.selectedTeam.id === team.id) {
                  this.teamMembers = members;
                }
                this.cdr.detectChanges();
              },
              error: error => {
                console.error(`Error loading members for team ${team.id}:`, error);
                team.members = [];
              }
            });
          });
          this.assignLeadNames();
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Error loading teams:', error);
          if (!environment.production) {
            // Fallback mock data (shortened to essentials)
            this.teams = [
              { id: 1, teamName: 'Frontend Development', description: 'UI/UX development and frontend architecture', status: 1, pOwner: 1, sMaster: 2, createdAt: '2024-01-15T10:30:00Z', leadName: 'John Smith', members: [] },
              { id: 2, teamName: 'Backend API', description: 'Server-side development and API design', status: 1, pOwner: 3, sMaster: 4, createdAt: '2024-01-10T08:00:00Z', leadName: 'Emily Davis', members: [] }
            ];
            this.assignLeadNames();
            this.cdr.detectChanges();
            resolve();
            return;
          }
          this.error = 'Failed to load teams. Please try again.';
          this.cdr.detectChanges();
          resolve();
        }
      });
    });
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          console.log('Users loaded:', users.length);
          this.assignLeadNames();
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          
          // For development: Add mock data when API is not available
          if (!environment.production) {
            console.log('Loading mock users data for development...');
            this.users = [
              { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', username: 'jsmith', role: UserRole.DEVELOPER, activeStatus: undefined, createdate: '2024-01-01T00:00:00Z', employeeId: 'EMP001' },
              { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com', username: 'sjohnson', role: UserRole.DEVELOPER, activeStatus: undefined, createdate: '2024-01-02T00:00:00Z', employeeId: 'EMP002' },
              { id: 3, firstName: 'Mike', lastName: 'Wilson', email: 'mike.wilson@company.com', username: 'mwilson', role: UserRole.DEVELOPER, activeStatus: undefined, createdate: '2024-01-03T00:00:00Z', employeeId: 'EMP003' },
              { id: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@company.com', username: 'edavis', role: UserRole.MANAGER, activeStatus: undefined, createdate: '2024-01-04T00:00:00Z', employeeId: 'EMP004' },
              { id: 5, firstName: 'Alex', lastName: 'Brown', email: 'alex.brown@company.com', username: 'abrown', role: UserRole.DEVELOPER, activeStatus: undefined, createdate: '2024-01-05T00:00:00Z', employeeId: 'EMP005' },
              { id: 6, firstName: 'David', lastName: 'Chen', email: 'david.chen@company.com', username: 'dchen', role: UserRole.ADMIN, activeStatus: undefined, createdate: '2024-01-06T00:00:00Z', employeeId: 'EMP006' }
            ];
            this.assignLeadNames();
            this.cdr.detectChanges();
            resolve();
            return;
          }
          
          this.notificationService.error('Error', 'Failed to load users. Please refresh the page.');
          reject(error);
        }
      });
    });
  }

  loadTeamMembers(teamId: number) {
    console.log('Loading team members for team ID:', teamId);
    this.teamService.getTeamMembers(teamId).subscribe({
      next: (members) => {
        console.log('Team members loaded:', members);
        this.teamMembers = members;
        
        // Update the team's member count in the main list
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
          team.members = members;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        
        // For development: Add mock members if API fails - Using your actual API data format
        if (!environment.production) {
          console.log('Loading mock team members for development with your API data format...');
          this.teamMembers = [
            {
              id: 2,
              userId: 2,
              teamId: teamId,
              userName: "Bob A. Smith",
              userEmail: "bob@example.com",
              role: "member",
              joinedDate: "2025-08-24"
            },
            {
              id: 21,
              userId: 21,
              teamId: teamId,
              userName: "Abdullah Al Mamun",
              userEmail: "abdullah@mislbd.com",
              role: "member",
              joinedDate: "2025-08-24"
            }
          ];
          
          console.log('Mock team members set:', this.teamMembers);
          console.log('showMemberModal state:', this.showMemberModal);
          this.cdr.detectChanges();
          return;
        }
        
        this.notificationService.error('Error', 'Failed to load team members.');
      }
    });
  }

  // CRUD Operations
  addTeam() {
    this.isAdd = true;
    this.isEdit = false;
    this.selectedTeam = null;
    this.resetForm();
  }

  editTeam(team: Team) {
    this.isEdit = true;
    this.isAdd = false;
    this.selectedTeam = team;
    this.teamForm = {
      teamName: team.teamName,
      description: team.description,
      pOwner: team.pOwner,
      sMaster: team.sMaster,
      status: team.status
    };
  }

  saveTeam() {
    if (!this.teamForm.teamName.trim()) {
      this.error = 'Team name is required';
      return;
    }

    this.isLoading = true;
    this.error = null;

    if (this.isAdd) {
      this.teamService.createTeam(this.teamForm).subscribe({
        next: (team) => {
          this.teams.push(team);
          this.notificationService.success(
            'Team Created', 
            `Team "${team.teamName}" has been created successfully.`
          );
          this.cancel();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = 'Failed to create team. Please try again.';
          this.notificationService.error(
            'Creation Failed', 
            'Failed to create team. Please try again.'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error creating team:', error);
        }
      });
    } else if (this.isEdit && this.selectedTeam) {
      const updateRequest: UpdateTeamRequest = {
        ...this.teamForm,
        id: this.selectedTeam.id
      };

      this.teamService.updateTeam(updateRequest).subscribe({
        next: (updatedTeam) => {
          const index = this.teams.findIndex(t => t.id === updatedTeam.id);
          if (index !== -1) {
            this.teams[index] = updatedTeam;
          }
          this.notificationService.success(
            'Team Updated', 
            `Team "${updatedTeam.teamName}" has been updated successfully.`
          );
          this.cancel();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.error = 'Failed to update team. Please try again.';
          this.notificationService.error(
            'Update Failed', 
            'Failed to update team. Please try again.'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error updating team:', error);
        }
      });
    }
  }

  confirmDeleteTeam(team: Team) {
    this.teamToDelete = team;
    this.showDeleteConfirm = true;
  }

  deleteTeam() {
    if (!this.teamToDelete) return;

    const teamName = this.teamToDelete.teamName;
    this.isLoading = true;
    this.teamService.deleteTeam(this.teamToDelete.id).subscribe({
      next: () => {
        this.teams = this.teams.filter(t => t.id !== this.teamToDelete!.id);
        this.notificationService.success(
          'Team Deleted', 
          `Team "${teamName}" has been deleted successfully.`
        );
        this.showDeleteConfirm = false;
        this.teamToDelete = null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to delete team. Please try again.';
        this.notificationService.error(
          'Deletion Failed', 
          'Failed to delete team. Please try again.'
        );
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error deleting team:', error);
      }
    });
  }

  // Team Member Operations
  viewTeamMembers(team: Team) {
    console.log('[Members] Button clicked for team', team.id);
    this.selectedTeam = team;
    this.showMemberModal = true; // show first
    this.teamMembers = []; // clear previous
    this.cdr.detectChanges();
    // Load real members
    this.loadTeamMembers(team.id);
    // Ensure users loaded for dropdown
    if (!this.users.length) {
      this.loadUsers();
    }
    this.newMemberForm = { userId: 0, role: 'member' };
  }

  addTeamMember() {
    if (!this.selectedTeam || !this.newMemberForm.userId) return;
    if (this.teamMembers.some(m => m.userId === this.newMemberForm.userId)) {
      this.notificationService.error('Duplicate', 'This user is already a member.');
      return;
    }

    this.isLoading = true;
    this.teamService.addTeamMember(
      this.selectedTeam.id,
      this.newMemberForm.userId,
      this.newMemberForm.role
    ).subscribe({
      next: (member) => {
        this.teamMembers.push(member);
        const team = this.teams.find(t => t.id === this.selectedTeam!.id);
        if (team) {
          if (!team.members) team.members = [];
          team.members.push(member);
        }
        this.newMemberForm = { userId: 0, role: 'member' };
        this.notificationService.success('Success', 'Member added');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding team member:', error);
        if (error.status === 409 || error.error?.message?.includes('already a member')) {
          this.notificationService.error('Error', 'User already a member.');
        } else if (error.status === 404) {
          this.notificationService.error('Error', 'Team or user not found.');
        } else {
          this.notificationService.error('Error', 'Failed to add member.');
        }
      }
    });
  }

  // UI Helpers referenced in template
  refreshTeams() {
    this.isLoading = true;
    this.loadTeams()
      .then(() => this.notificationService.success('Refreshed', 'Teams list updated'))
      .catch(() => this.notificationService.error('Error', 'Failed to refresh teams'))
      .finally(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  updateMemberRole(member: TeamMember, newRole: string) {
    if (!this.selectedTeam) return;

    this.teamService.updateTeamMemberRole(
      this.selectedTeam.id,
      member.id,
      newRole
    ).subscribe({
      next: (updatedMember) => {
        const index = this.teamMembers.findIndex(m => m.id === updatedMember.id);
        if (index !== -1) {
          this.teamMembers[index] = updatedMember;
        }
        this.notificationService.success('Success', 'Member role updated successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating member role:', error);
        this.notificationService.error('Error', 'Failed to update member role. Please try again.');
      }
    });
  }

  removeTeamMember(member: TeamMember) {
    if (!this.selectedTeam) return;

    this.teamService.removeTeamMember(this.selectedTeam.id, member.id).subscribe({
      next: () => {
        this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
        
        // Update the team's member count in the main list
        const team = this.teams.find(t => t.id === this.selectedTeam!.id);
        if (team && team.members) {
          team.members = team.members.filter(m => m.id !== member.id);
        }
        
        this.notificationService.success('Success', 'Team member removed successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error removing team member:', error);
        this.notificationService.error('Error', 'Failed to remove team member. Please try again.');
      }
    });
  }

  // Helper methods
  cancel() {
    this.isAdd = false;
    this.isEdit = false;
    this.selectedTeam = null;
    this.resetForm();
    this.error = null;
  }

  resetForm() {
    this.teamForm = {
      teamName: '',
      description: '',
      pOwner: undefined,
      sMaster: undefined,
      status: TeamStatus.ACTIVE
    };
  }

  closeMemberModal() {
    this.showMemberModal = false;
    this.selectedTeam = null;
    this.teamMembers = [];
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case TeamStatus.ACTIVE: return 'status-active';
      case TeamStatus.INACTIVE: return 'status-inactive';
      case TeamStatus.COMPLETED: return 'status-completed';
      default: return 'status-inactive';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case TeamStatus.ACTIVE: return 'Active';
      case TeamStatus.INACTIVE: return 'Inactive';
      case TeamStatus.COMPLETED: return 'Completed';
      default: return 'Unknown';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'lead': return 'role-lead';
      case 'admin': return 'role-admin';
      case 'member': return 'role-member';
      default: return 'role-member';
    }
  }

  // Derive lead names from pOwner if leadName missing
  private assignLeadNames() {
    if (!this.users?.length || !this.teams?.length) return;
    this.teams.forEach(team => {
      if (!team.leadName && team.pOwner) {
        const u = this.users.find(x => x.id === team.pOwner);
        if (u) team.leadName = `${u.firstName} ${u.lastName}`;
      }
    });
  }

  getLeadName(team: Team): string | undefined {
    if (team.leadName) return team.leadName;
    if (team.pOwner) {
      const u = this.users.find(x => x.id === team.pOwner);
      return u ? `${u.firstName} ${u.lastName}` : undefined;
    }
    return undefined;
  }
}
