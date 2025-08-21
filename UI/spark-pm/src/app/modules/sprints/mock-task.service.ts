import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockTaskService {
  listTasks(): Observable<any[]> {
    return of([
      { id: 1, title: 'Task 1', status: 'todo', description: 'Sample task 1' },
      { id: 2, title: 'Task 2', status: 'in-progress', description: 'Sample task 2' },
      { id: 3, title: 'Task 3', status: 'done', description: 'Sample task 3' }
    ]);
  }

  updateTask(task: any): Observable<any> {
    return of(task);
  }

  createTask(task: any): Observable<any> {
    return of({ ...task, id: Math.random() * 1000 });
  }

  deleteTask(id: number): Observable<void> {
    return of(void 0);
  }
}
