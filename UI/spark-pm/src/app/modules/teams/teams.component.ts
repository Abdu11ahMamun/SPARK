import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest, TeamStatus } from './team.model';
import { TeamService } from './team.service';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
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
    this.loadTeams();
    this.loadUsers();
  }

  refreshTeams() {
    this.loadTeams();
  }

  loadTeams() {
    console.log('Starting to load teams...');
    this.isLoading = true;
    this.error = null;
    
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        console.log('Teams received:', teams);
        this.teams = teams;
        
        // Load member counts for each team
        this.teams.forEach(team => {
          this.teamService.getTeamMembers(team.id).subscribe({
            next: (members) => {
              team.members = members;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error(`Error loading members for team ${team.id}:`, error);
              team.members = []; // Set empty array if error
            }
          });
        });
        
        this.isLoading = false;
        console.log('Loading state set to false');
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.error = 'Failed to load teams. Please try again.';
        this.isLoading = false;
        console.log('Loading state set to false due to error');
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          console.log('Users loaded:', users.length);
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notificationService.error('Error', 'Failed to load users. Please refresh the page.');
          reject(error);
        }
      });
    });
  }

  loadTeamMembers(teamId: number) {
    this.teamService.getTeamMembers(teamId).subscribe({
      next: (members) => {
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
    this.selectedTeam = team;
    this.loadTeamMembers(team.id);
    
    // Only show modal after users are loaded
    if (this.users.length === 0) {
      this.isLoading = true;
      this.loadUsers().then(() => {
        this.isLoading = false;
        this.showMemberModal = true;
        this.newMemberForm = { userId: 0, role: 'member' };
      }).catch(() => {
        this.isLoading = false;
      });
    } else {
      this.showMemberModal = true;
      this.newMemberForm = { userId: 0, role: 'member' };
    }
  }

  addTeamMember() {
    if (!this.selectedTeam || !this.newMemberForm.userId) return;

    this.isLoading = true;
    this.teamService.addTeamMember(
      this.selectedTeam.id,
      this.newMemberForm.userId,
      this.newMemberForm.role
    ).subscribe({
      next: (member) => {
        this.teamMembers.push(member);
        
        // Update the team's member count in the main list
        const team = this.teams.find(t => t.id === this.selectedTeam!.id);
        if (team) {
          if (!team.members) team.members = [];
          team.members.push(member);
        }
        
        this.newMemberForm = { userId: 0, role: 'member' };
        this.notificationService.success('Success', 'Team member added successfully!');
        this.showMemberModal = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding team member:', error);
        
        // Handle specific error messages
        if (error.status === 409 || error.error?.message?.includes('already a member')) {
          this.notificationService.error('Error', 'User is already a member of this team.');
        } else if (error.status === 404) {
          this.notificationService.error('Error', 'Team or user not found.');
        } else {
          this.notificationService.error('Error', 'Failed to add team member. Please try again.');
        }
      }
    });
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
}
