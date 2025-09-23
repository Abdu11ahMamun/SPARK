import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TaskComment } from './task-comment.model';

@Component({
  selector: 'app-task-comments-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-comments-dialog.component.html',
  styleUrls: ['./task-comments-dialog.component.scss']
})
export class TaskCommentsDialogComponent implements OnChanges {
  @Input() taskId!: number | null;
  @Input() open = false;
  @Input() currentUserId: number | null = null;
  @Output() close = new EventEmitter<void>();

  loading = false;
  posting = false;
  error: string | null = null;
  comments: TaskComment[] = [];
  newComment = '';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.open && this.taskId) {
      this.load();
    }
  }

  load() {
    if (!this.taskId) return;
    this.loading = true; this.error = null;
    this.http.get<TaskComment[]>(`${environment.apiUrl}/api/tasks/${this.taskId}/comments`).subscribe({
      next: res => { this.comments = res || []; this.loading = false; setTimeout(()=>this.scrollToEnd(),50); },
      error: err => { console.error(err); this.error = 'Failed to load comments'; this.loading = false; }
    });
  }

  add() {
    if (!this.taskId || !this.newComment.trim()) return;
    const payload = { commentText: this.newComment.trim(), authorUserId: this.currentUserId };
    this.posting = true;
    this.http.post<TaskComment>(`${environment.apiUrl}/api/tasks/${this.taskId}/comments`, payload).subscribe({
      next: res => {
        this.comments.push(res);
        this.newComment = '';
        this.posting = false;
        setTimeout(()=>this.scrollToEnd(), 30);
      },
      error: err => { console.error(err); this.posting = false; }
    });
  }

  scrollToEnd() {
    const el = document.querySelector('.tc-comments');
    if (el) el.scrollTop = el.scrollHeight;
  }

  onClose() { this.close.emit(); }
}
