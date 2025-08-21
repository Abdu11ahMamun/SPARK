import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KanbanCard { id: number; title: string; assignee?: string; points?: number; }

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="kanban-board">
    <div class="kanban-column" *ngFor="let col of columns" (dragover)="$event.preventDefault()" (drop)="onDrop($event, col.key)">
      <div class="column-header">{{ col.title }}</div>
      <div class="cards">
        <div class="card" *ngFor="let c of board[col.key]" draggable="true" (dragstart)="onDragStart($event,c)">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-meta">{{ c.assignee || 'Unassigned' }} • {{ c.points || 0 }} pts</div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [
    `.kanban-board{display:flex;gap:1rem}.kanban-column{flex:1;background:#f8fafc;border:1px solid #e6eef8;border-radius:8px;padding:0.75rem;min-height:200px}.column-header{font-weight:700;margin-bottom:0.5rem}.card{background:#fff;border-radius:6px;padding:0.5rem;margin-bottom:0.5rem;box-shadow:0 1px 2px rgba(0,0,0,.05);cursor:grab}.card-title{font-weight:600}.card-meta{font-size:.8rem;color:#64748b}`
  ]
})
export class KanbanComponent {
  @Input() board: { [key: string]: KanbanCard[] } = { todo: [], inprogress: [], done: [] };
  @Output() moved = new EventEmitter<{ card: KanbanCard; to: string }>();

  columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'inprogress', title: 'In Progress' },
    { key: 'done', title: 'Done' }
  ];

  private dragged?: KanbanCard;

  onDragStart(ev: DragEvent, card: KanbanCard) {
    this.dragged = card;
    try { ev.dataTransfer?.setData('text/plain', String(card.id)); } catch(e){}
  }

  onDrop(ev: DragEvent, to: string) {
    ev.preventDefault();
    if (!this.dragged) return;
    this.moved.emit({ card: this.dragged, to });
    this.dragged = undefined;
  }
}
