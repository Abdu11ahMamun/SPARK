import { HttpInterceptorFn, HttpResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Interceptor: show success for mutating requests, error for failures.
// Skip notifications if header 'X-Skip-Notification' is present.
export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  const method = req.method.toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const skip = req.headers.has('X-Skip-Notification');

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (!skip && isMutating) {
          // Only success for 2xx
          const statusGroup = Math.floor(event.status / 100);
          if (statusGroup === 2) {
            const resourceHint = deriveResource(req.url, method);
            const verb = friendlyVerb(method);
            notificationService.success(
              'Operation Successful',
              `${verb} ${resourceHint} completed.`
            );
          }
        }
      }
    }),
    catchError(err => {
      if (!skip) {
        const status = err.status;
        const body = err.error || {};
        // Try common backend field names
        const detail = body.message || body.error || body.detail || body.reason || body.description;
        let resourceHint = deriveResource(req.url, method);
        const verb = friendlyVerb(method);

        let msg: string;
        if (status) {
          if (detail) {
            msg = `${detail}`;
          } else {
            msg = `HTTP ${status} - ${err.statusText || 'Request failed'}`;
          }
        } else {
          msg = detail || 'Network or server error.';
        }

        // Specific friendly mapping for 400 duplicate assignment
        if (status === 400 && /already assigned/i.test(detail || '')) {
          msg = `Permission is already assigned to the selected role.`;
        }

        notificationService.error(
          `${verb} ${resourceHint} failed`,
          msg
        );
      }
      return throwError(() => err);
    })
  );
};

// Derive a readable resource name from URL
function deriveResource(url: string, method: string): string {
  const clean = url.split('?')[0];
  const segments = clean.split('/').filter(Boolean);
  if (segments.length === 0) return 'resource';
  let last = segments[segments.length - 1];
  // If last segment looks like an ID, use the previous
  if (/^\d+$/.test(last) && segments.length > 1) {
    last = segments[segments.length - 2];
  }
  return last.replace(/[-_]/g, ' ');
}

// Map HTTP method to a friendlier verb
function friendlyVerb(method: string): string {
  switch (method) {
    case 'POST': return 'Create';
    case 'PUT': return 'Update';
    case 'PATCH': return 'Modify';
    case 'DELETE': return 'Delete';
    default: return method;
  }
}
