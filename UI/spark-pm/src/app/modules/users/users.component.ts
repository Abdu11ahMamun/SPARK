import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, UserStatus } from './user.model';
import { NotificationService } from '../../core/services/notification.service';
import { TeamService } from '../teams/team.service';
import { Team } from '../teams/team.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  isEdit = false;
  isAdd = false;
  isLoading = false;
  error: string | null = null;
  showDeleteConfirm = false;
  userToDelete: User | null = null;
  showSearchPanel = false;
  userTeamsMap = new Map<number, Team[]>(); // Map to store user teams

  // Search and filter
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  employeeIdFilter = '';
  phoneFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalUsers = 0;
  totalPages = 0;

  // Form data
  userForm: CreateUserRequest = {
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    employeeId: '',
    role: UserRole.DEVELOPER,
    activeStatus: UserStatus.ACTIVE
  };

  // Enums for template
  UserRole = UserRole;
  UserStatus = UserStatus;

  constructor(
    private userService: UserService, 
    private cdr: ChangeDetectorRef, 
    private notificationService: NotificationService,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadUserTeams();
  }

  loadUsers() {
    if (this.isLoading) {
      return;
    }
    
    console.log('Starting to load users...');
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users received:', users);
        this.users = users;
        this.updatePagination();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUserTeams() {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        // Clear previous data
        this.userTeamsMap.clear();
        
        // For each team, load its members and map them to users
        teams.forEach(team => {
          this.teamService.getTeamMembers(team.id).subscribe({
            next: (members) => {
              members.forEach(member => {
                if (!this.userTeamsMap.has(member.userId)) {
                  this.userTeamsMap.set(member.userId, []);
                }
                this.userTeamsMap.get(member.userId)!.push(team);
              });
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error(`Error loading members for team ${team.id}:`, error);
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  getUserTeams(userId: number | undefined): Team[] {
    if (!userId) {
      return [];
    }
    return this.userTeamsMap.get(userId) || [];
  }

  refreshUsers() {
    this.loadUsers();
    this.loadUserTeams(); // Also refresh team data
    this.notificationService.success('Success', 'Users refreshed successfully');
  }

  toggleSearchPanel() {
    this.showSearchPanel = !this.showSearchPanel;
  }

  updatePagination() {
    this.totalUsers = this.users.length;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  applyFilters() {
    let filtered = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.activeStatus === this.selectedStatus;
      
      const matchesEmployeeId = !this.employeeIdFilter || 
        (user.employeeId && user.employeeId.toLowerCase().includes(this.employeeIdFilter.toLowerCase()));
      
      const matchesPhone = !this.phoneFilter || 
        (user.phone && user.phone.includes(this.phoneFilter));
      
      let matchesDateRange = true;
      if (this.dateFromFilter || this.dateToFilter) {
        if (user.createdate) {
          const userDate = new Date(user.createdate);
          if (this.dateFromFilter) {
            const fromDate = new Date(this.dateFromFilter);
            matchesDateRange = matchesDateRange && userDate >= fromDate;
          }
          if (this.dateToFilter) {
            const toDate = new Date(this.dateToFilter);
            toDate.setHours(23, 59, 59, 999); // End of day
            matchesDateRange = matchesDateRange && userDate <= toDate;
          }
        }
      }
      
      return matchesSearch && matchesRole && matchesStatus && matchesEmployeeId && matchesPhone && matchesDateRange;
    });

    // Update pagination based on filtered results
    this.totalUsers = filtered.length;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.employeeIdFilter = '';
    this.phoneFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.currentPage = 1;
    this.applyFilters();
    this.notificationService.success('Success', 'Filters cleared');
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  getStartIndex(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalUsers);
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalUsers);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Filter event handlers
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onRoleFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onEmployeeIdFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPhoneFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onDateFilterChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleUserStatus(user: User) {
    const newStatus = user.activeStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const statusAction = newStatus === UserStatus.ACTIVE ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${statusAction} user "${this.getFullName(user)}"?`)) {
      this.isLoading = true;
      // In a real implementation, you would call a service method to update the status
      // For now, we'll just update locally
      user.activeStatus = newStatus;
      this.isLoading = false;
      this.notificationService.success('Success', `User ${statusAction}d successfully`);
      this.applyFilters();
    }
  }

  selectUser(user: User) {
    this.selectedUser = { ...user };
    this.userForm = {
      firstName: user.firstName,
      middleName: user.middleName || '',
      lastName: user.lastName,
      username: user.username,
      password: '', // Don't pre-fill password
      email: user.email,
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      role: user.role,
      activeStatus: user.activeStatus || UserStatus.ACTIVE
    };
    this.isEdit = true;
    this.isAdd = false;
    this.error = null;
  }

  addUser() {
    this.selectedUser = null;
    this.userForm = {
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      employeeId: '',
      role: UserRole.DEVELOPER,
      activeStatus: UserStatus.ACTIVE
    };
    this.isAdd = true;
    this.isEdit = false;
    this.error = null;
  }

  saveUser() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    if (this.isAdd) {
      this.userService.createUser(this.userForm).subscribe({
        next: (user) => {
          console.log('User created successfully:', user);
          this.users.push(user);
          this.applyFilters();
          this.cancel();
          this.isLoading = false;
          this.notificationService.success('Success', 'User created successfully');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating user:', error);
          this.error = 'Failed to create user. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.isEdit && this.selectedUser) {
      const updateRequest: UpdateUserRequest = {
        id: this.selectedUser.id!,
        firstName: this.userForm.firstName,
        middleName: this.userForm.middleName,
        lastName: this.userForm.lastName,
        username: this.userForm.username,
        email: this.userForm.email,
        phone: this.userForm.phone,
        employeeId: this.userForm.employeeId,
        role: this.userForm.role,
        activeStatus: this.userForm.activeStatus
      };

      this.userService.updateUser(updateRequest).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully:', updatedUser);
          const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.applyFilters();
          this.cancel();
          this.isLoading = false;
          this.notificationService.success('Success', 'User updated successfully');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          this.error = 'Failed to update user. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDeleteUser(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  deleteUser() {
    if (!this.userToDelete || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.userService.deleteUser(this.userToDelete.id!).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.applyFilters();
        this.cancel();
        this.isLoading = false;
        this.notificationService.success('Success', 'User deleted successfully');
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        this.error = 'Failed to delete user. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.selectedUser = null;
    this.userToDelete = null;
    this.isEdit = false;
    this.isAdd = false;
    this.showDeleteConfirm = false;
    this.error = null;
    this.userForm = {
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      employeeId: '',
      role: UserRole.DEVELOPER,
      activeStatus: UserStatus.ACTIVE
    };
  }

  getFullName(user: User): string {
    return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
  }

  getRoleBadgeClass(role: UserRole): string {
    return `role-${role.toLowerCase().replace('_', '-')}`;
  }

  getStatusBadgeClass(status: UserStatus | undefined): string {
    if (!status) return 'status-inactive';
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'DEVELOPER': return 'Developer';
      case 'TESTER': return 'Tester';
      case 'PROJECT_MANAGER': return 'Project Manager';
      case 'BUSINESS_ANALYST': return 'Business Analyst';
      case 'DESIGNER': return 'Designer';
      case 'DEVOPS': return 'DevOps';
      case 'SCRUM_MASTER': return 'Scrum Master';
      default: return role;
    }
  }

  getStatusDisplayName(status: string | UserStatus | undefined): string {
    if (!status) return 'Inactive';
    const statusString = String(status);
    switch (statusString) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      case 'SUSPENDED': return 'Suspended';
      case 'PENDING': return 'Pending';
      default: return statusString;
    }
  }

  isUserActive(status: UserStatus | undefined): boolean {
    return status === 'ACTIVE';
  }
}
