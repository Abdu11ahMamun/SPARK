import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskTypeService } from '../../../core/services/task-type.service';
import { TaskTypeModel } from '../../../core/models/task-type.model';
import { NotificationService } from '../../../core/services/notification.service';
import { catchError, finalize, timeout, of } from 'rxjs';

@Component({
  selector: 'app-task-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-types.component.html',
  styleUrls: ['./task-types.component.scss']
})
export class TaskTypesComponent implements OnInit {
  types: TaskTypeModel[] = [];
  filtered: TaskTypeModel[] = [];
  search = '';
  isLoading = false;
  isAddEdit = false;
  isSkeleton = false;
  errorMessage: string | null = null;
  editTarget: TaskTypeModel | null = null;
  form: Partial<TaskTypeModel> = { name: '', description: '', active: true };
  showDeleteConfirm = false;
  deleting: TaskTypeModel | null = null;

  constructor(private typeService: TaskTypeService, private cd: ChangeDetectorRef, private notify: NotificationService) {}
  ngOnInit(): void { this.load(); }

  load(retry = false) {
    this.errorMessage = null;
    this.isLoading = true;
    this.isSkeleton = true;
    this.typeService.getAll()
      .pipe(
        timeout({ first: 10000 }),
        catchError(err => {
          console.error('[TaskTypes] Load failed:', err);
          this.errorMessage = err?.name === 'TimeoutError' ? 'Request timed out. Please retry.' : 'Failed to load task types.';
          this.notify.error('Error', this.errorMessage);
          return of([] as TaskTypeModel[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.isSkeleton = false;
          this.cd.detectChanges();
        })
      )
      .subscribe(data => {
        if (this.errorMessage && data && data.length) this.errorMessage = null;
        this.types = data || [];
        this.applyFilter();
      });
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? this.types : this.types.filter(t => t.name.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
  }

  addNew() { this.isAddEdit = true; this.editTarget = null; this.form = { name: '', description: '', active: true }; }
  edit(type: TaskTypeModel) { this.isAddEdit=true; this.editTarget = type; this.form = { ...type }; }
  cancel() { this.isAddEdit=false; this.editTarget=null; }

  save() {
    if (!this.form.name || !this.form.name.trim()) { this.notify.error('Validation','Name is required'); return; }
    const payload = { name: this.form.name.trim(), description: this.form.description?.trim(), active: this.form.active ?? true };
    if (this.editTarget) {
      this.typeService.update(this.editTarget.id!, payload).subscribe({
        next: updated => { const idx = this.types.findIndex(t => t.id===updated.id); if (idx>-1) this.types[idx]=updated; this.notify.success('Updated','Task type updated'); this.afterSave(); },
        error: err => { this.notify.error('Error','Update failed'); console.error(err); }
      });
    } else {
      this.typeService.create(payload).subscribe({
        next: created => { this.types.push(created); this.notify.success('Created','Task type created'); this.afterSave(); },
        error: err => { this.notify.error('Error', err.status===409?'Task type exists':'Create failed'); console.error(err); }
      });
    }
  }

  confirmDelete(type: TaskTypeModel) { this.showDeleteConfirm=true; this.deleting=type; }
  deleteConfirmed() { if(!this.deleting) return; this.typeService.delete(this.deleting.id!).subscribe({
    next: () => { this.types = this.types.filter(t => t.id!==this.deleting!.id); this.notify.success('Deleted','Task type deleted'); this.showDeleteConfirm=false; this.deleting=null; this.applyFilter(); },
    error: err => { this.notify.error('Error','Delete failed'); console.error(err); }
  }); }

  private afterSave() { this.applyFilter(); this.isAddEdit=false; this.editTarget=null; this.form={ name:'', description:'', active:true }; }
  retry() { this.load(true); }
  
  trackByFn(index: number, item: TaskTypeModel): any {
    return item.id || index;
  }
}
