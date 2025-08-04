import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, retry, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private pendingRequests = new Map<string, Observable<HttpEvent<any>>>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Create a unique key for this request
    const requestKey = `${req.method}-${req.url}`;
    
    // Check if this request is already pending
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    // Add timeout and retry logic
    const timeoutDuration = 10000; // 10 seconds
    const retryCount = 2;

    const request$ = next.handle(req).pipe(
      timeout(timeoutDuration),
      retry(retryCount),
      tap((event) => {
        if (event instanceof HttpResponse) {
          // Request completed, remove from pending
          this.pendingRequests.delete(requestKey);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Request failed, remove from pending
        this.pendingRequests.delete(requestKey);
        
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              errorMessage = 'Unable to connect to server. Please check your connection.';
              break;
            case 404:
              errorMessage = 'Requested resource not found.';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
            default:
              errorMessage = `Server returned error ${error.status}: ${error.message}`;
          }
        }
        
        console.error('HTTP Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );

    // Store the request
    this.pendingRequests.set(requestKey, request$);
    
    return request$;
  }
}
