import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { RoleModel } from '../../../core/models/role.model';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, catchError, timeout, of } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: RoleModel[] = [];
  filtered: RoleModel[] = [];
  search = '';
  isLoading = false;
  isSkeleton = false;
  isAddEdit = false;
  editTarget: RoleModel | null = null;
  form: Partial<RoleModel> = { name: '', description: '', active: true };
  showDeleteConfirm = false;
  deleting: RoleModel | null = null;
  errorMessage: string | null = null;

  constructor(private roleService: RoleService, private cd: ChangeDetectorRef, private notify: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(retry = false) {
    this.errorMessage = null;
    this.isLoading = true;
    this.isSkeleton = true;
    this.roleService.getAll()
      .pipe(
        timeout({ first: 10000 }),
        catchError(err => {
          console.error('[Roles] Load failed:', err);
          this.errorMessage = err?.name === 'TimeoutError' ? 'Request timed out. Please retry.' : 'Failed to load roles.';
          if (!this.roles.length) { // optional lightweight mock fallback to let UI show something
            this.roles = [];
            this.applyFilter();
          }
          this.notify.error('Error', this.errorMessage);
          return of([] as RoleModel[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.isSkeleton = false;
          this.cd.detectChanges();
        })
      )
      .subscribe(data => {
        // If we previously had an errorMessage but data arrived (late), clear it.
        if (this.errorMessage && data && data.length) this.errorMessage = null;
        this.roles = data || [];
        this.applyFilter();
      });
  }

  applyFilter() {
    const q = this.search.toLowerCase();
    this.filtered = !q ? this.roles : this.roles.filter(r => r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q));
  }

  addNew() { this.isAddEdit = true; this.editTarget = null; this.form = { name: '', description: '', active: true }; }
  edit(role: RoleModel) { this.isAddEdit = true; this.editTarget = role; this.form = { ...role }; }
  cancel() { this.isAddEdit = false; this.editTarget = null; }

  save() {
    if (!this.form.name || !this.form.name.trim()) { this.notify.error('Validation','Name is required'); return; }
    const payload = { name: this.form.name.trim(), description: this.form.description?.trim(), active: this.form.active ?? true };
    if (this.editTarget) {
      this.roleService.update(this.editTarget.id!, payload).subscribe({
        next: updated => { const idx = this.roles.findIndex(r => r.id===updated.id); if (idx>-1) this.roles[idx]=updated; this.notify.success('Updated','Role updated'); this.afterSave(); },
        error: err => { this.notify.error('Error','Update failed'); console.error(err); }
      });
    } else {
      this.roleService.create(payload).subscribe({
        next: created => { this.roles.push(created); this.notify.success('Created','Role created'); this.afterSave(); },
        error: err => { this.notify.error('Error', err.status===409?'Role already exists':'Create failed'); console.error(err); }
      });
    }
  }

  confirmDelete(role: RoleModel) { this.showDeleteConfirm = true; this.deleting = role; }
  deleteConfirmed() {
    if (!this.deleting) return; this.roleService.delete(this.deleting.id!).subscribe({
      next: () => { this.roles = this.roles.filter(r => r.id!==this.deleting!.id); this.notify.success('Deleted','Role deleted'); this.showDeleteConfirm=false; this.deleting=null; this.applyFilter(); },
      error: err => { this.notify.error('Error','Delete failed'); console.error(err); }
    });
  }

  private afterSave() { this.applyFilter(); this.isAddEdit=false; this.editTarget=null; this.form={ name:'', description:'', active:true }; }
  retry() { this.load(true); }
  
  trackByFn(index: number, item: RoleModel): any {
    return item.id || index;
  }
}
