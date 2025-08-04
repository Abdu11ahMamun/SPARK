import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  isLoading(key: string): boolean {
    const subject = this.loadingStates.get(key);
    return subject ? subject.value : false;
  }

  setLoading(key: string, loading: boolean): void {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    this.loadingStates.get(key)!.next(loading);
  }

  getLoadingState(key: string): BehaviorSubject<boolean> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(key)!;
  }
}
