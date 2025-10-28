import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check session validity before making API calls
    if (!this.authService.isAuthenticated()) {
      console.log('🔐 Session invalid, redirecting to login');
      this.authService.logout();
      return throwError(() => new Error('Session expired'));
    }

    return next.handle(request).pipe(
      catchError((error) => {
        // Handle 401 responses (unauthorized)
        if (error.status === 401) {
          console.log('🔐 Received 401, session may be expired');
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}