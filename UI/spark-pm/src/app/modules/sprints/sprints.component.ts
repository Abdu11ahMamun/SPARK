import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Team {
  id: number;
  name: string;
}

interface SprintUser {
  id: number;
  name: string;
  userCapacity: number;
  leaveDays: number;
  totalWorkingHour: number;
  userWorkingHour: number;
}

@Component({
  selector: 'app-sprints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sprints.component.html',
  styleUrl: './sprints.component.scss'
})
export class SprintsComponent {
  // Modal state
  showSprintModal = false;
  activeTab: 'Sprint Declare' | 'Sprint Task Info' = 'Sprint Declare';
  
  // Form data
  selectedTeam = 'Investment Team';
  sprintName = 'Team - Investment Team | Sprint - 01';
  fromDate = '';
  toDate = '';
  totalSprintDays = 0;
  noOfHolidays = 0;
  sprintPoint = '';
  detailsRemark = '';
  
  // Teams data
  teams: Team[] = [
    { id: 1, name: 'Investment Team' },
    { id: 2, name: 'Development Team' },
    { id: 3, name: 'Testing Team' }
  ];
  
  // Users data
  sprintUsers: SprintUser[] = [
    { id: 1, name: 'Ali Ahmed', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 },
    { id: 2, name: 'Md Saleh Ahmed Kabir', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 },
    { id: 3, name: 'Rakibul Islam', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 },
    { id: 4, name: 'Jyoti Roy', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 }
  ];

  openSprintModal() {
    this.showSprintModal = true;
  }

  closeSprintModal() {
    this.showSprintModal = false;
  }

  setActiveTab(tab: 'Sprint Declare' | 'Sprint Task Info') {
    this.activeTab = tab;
  }

  onDateChange() {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const timeDiff = to.getTime() - from.getTime();
      this.totalSprintDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }

  removeUser(index: number) {
    this.sprintUsers.splice(index, 1);
  }

  createSprint() {
    console.log('Creating sprint with data:', {
      selectedTeam: this.selectedTeam,
      sprintName: this.sprintName,
      fromDate: this.fromDate,
      toDate: this.toDate,
      totalSprintDays: this.totalSprintDays,
      noOfHolidays: this.noOfHolidays,
      sprintPoint: this.sprintPoint,
      detailsRemark: this.detailsRemark,
      sprintUsers: this.sprintUsers
    });
    this.closeSprintModal();
  }

  cancelSprint() {
    this.closeSprintModal();
  }
}
