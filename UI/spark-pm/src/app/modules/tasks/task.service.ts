import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
	private base = `${environment.apiUrl}`;
	constructor(private http: HttpClient) {}

	// Tasks
	listTasks(): Observable<any[]> {
		return this.http.get<any[]>(`${this.base}/api/tasks`);
	}

	// Prefer server-side filtering if supported
	listTasksBySprint(sprintId: number): Observable<any[]> {
		return this.http.get<any[]>(`${this.base}/api/tasks/by-sprint/${sprintId}`);
	}

	// Backward-compatible alias used by some callers
	getTasksBySprint(sprintId: number): Observable<any[]> {
		return this.listTasksBySprint(sprintId);
	}
	createTask(task: any): Observable<any> {
		return this.http.post<any>(`${this.base}/api/tasks`, task);
	}
	updateTask(id: number, task: any): Observable<void> {
		return this.http.put<void>(`${this.base}/api/tasks/${id}`, task);
	}
	deleteTask(id: number): Observable<void> {
		return this.http.delete<void>(`${this.base}/api/tasks/${id}`);
	}

	// Lookups
	listProducts(): Observable<any[]> {
		return this.http.get<any[]>(`${this.base}/api/products`);
	}
	listProductModules(): Observable<any[]> {
		return this.http.get<any[]>(`${this.base}/api/product-modules`);
	}
	listUsers(): Observable<any[]> {
		return this.http.get<any[]>(`${this.base}/api/users`);
	}
}
