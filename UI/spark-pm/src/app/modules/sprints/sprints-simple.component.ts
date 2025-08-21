import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanComponent } from './kanban.component';

@Component({
  selector: 'app-sprints-simple',
  standalone: true,
  imports: [CommonModule, FormsModule, KanbanComponent],
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.scss']
})
export class SprintsSimpleComponent {
  title = 'Sprint Management';
  
  // Modal state
  showSprintModal = false;
  activeTab: 'Sprint Declare' | 'Sprint Task Info' = 'Sprint Declare';
  
  // Form properties
  selectedTeam = 'Investment Team';
  sprintName = 'Team - Investment Team | Sprint - 01';
  fromDate = '';
  toDate = '';
  totalSprintDays = 0;
  noOfHolidays = 0;
  sprintPoint = '';
  detailsRemark = '';
  
  // Data arrays
  teams = [
    { id: 1, name: 'Investment Team' },
    { id: 2, name: 'Development Team' },
    { id: 3, name: 'Testing Team' }
  ];
  
  sprints: any[] = [];
  selectedSprint: any = null;
  availableTasks: any[] = [];
  kanbanBoard: { [key: string]: any[] } = { todo: [], inprogress: [], done: [] };
  
  sprintUsers = [
    { id: 1, name: 'Ali Ahmed', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 },
    { id: 2, name: 'Md Saleh Ahmed Kabir', userCapacity: 100, leaveDays: 0, totalWorkingHour: 0, userWorkingHour: 0 }
  ];
  
  // Methods
  openSprintModal() { this.showSprintModal = true; }
  closeSprintModal() { this.showSprintModal = false; }
  setActiveTab(tab: 'Sprint Declare' | 'Sprint Task Info') { this.activeTab = tab; }
  createSprint() { console.log('Create sprint'); this.closeSprintModal(); }
  cancelSprint() { this.closeSprintModal(); }
  selectSprint(sprint: any) { this.selectedSprint = sprint; }
  editSprint(sprint: any) { this.selectedSprint = sprint; this.openSprintModal(); }
  deleteSprint(sprint: any) { console.log('Delete sprint', sprint); }
  removeUser(index: number) { this.sprintUsers.splice(index, 1); }
  onDateChange() {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      const timeDiff = to.getTime() - from.getTime();
      this.totalSprintDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }
  getTeamName(teamId?: number) {
    const team = this.teams.find(t => t.id === teamId);
    return team?.name || '—';
  }
  addTaskToSprint(task: any) { console.log('Add task to sprint', task); }
  onCardMoved(event: any) { console.log('Card moved', event); }
}
