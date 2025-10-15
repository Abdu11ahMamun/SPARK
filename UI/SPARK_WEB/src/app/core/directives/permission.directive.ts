import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Structural directive to show/hide elements based on user permissions
 * 
 * Usage examples:
 * *hasPermission="'Users:create'" - Check single permission
 * *hasPermission="['Users:create', 'Users:edit']" - Check multiple permissions (OR)
 * *hasPermission="'Users:create'; requireAll: true" - Require all permissions (AND)
 * *hasPermission="'Users:create'; else: elseTemplate" - Show else template when no permission
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private elseTemplateRef: TemplateRef<any> | null = null;

  @Input('hasPermission') permissions: string | string[] = [];
  @Input('hasPermissionRequireAll') requireAll = false;
  @Input('hasPermissionElse') 
  set elseTemplate(templateRef: TemplateRef<any> | null) {
    this.elseTemplateRef = templateRef;
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
    
    // Initial check
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermissions();
    
    if (hasPermission && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
      
      if (this.elseTemplateRef) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
      }
    } else if (!hasPermission && !this.hasView && this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  private checkPermissions(): boolean {
    if (!this.permissions) return true;

    const permissionArray = Array.isArray(this.permissions) 
      ? this.permissions 
      : [this.permissions];

    if (permissionArray.length === 0) return true;

    if (this.requireAll) {
      return permissionArray.every(permission => 
        this.authService.hasAnyPermission([permission])
      );
    } else {
      return this.authService.hasAnyPermission(permissionArray);
    }
  }
}

/**
 * Structural directive to show/hide elements based on user roles
 * 
 * Usage examples:
 * *hasRole="'Admin'" - Check single role
 * *hasRole="['Admin', 'Manager']" - Check multiple roles (OR)
 * *hasRole="'Admin'; requireAll: true" - Require all roles (AND)
 * *hasRole="'Admin'; else: elseTemplate" - Show else template when no role
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private elseTemplateRef: TemplateRef<any> | null = null;

  @Input('hasRole') roles: string | string[] = [];
  @Input('hasRoleRequireAll') requireAll = false;
  @Input('hasRoleElse') 
  set elseTemplate(templateRef: TemplateRef<any> | null) {
    this.elseTemplateRef = templateRef;
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
    
    // Initial check
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasRole = this.checkRoles();
    
    if (hasRole && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
      
      if (this.elseTemplateRef) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
      }
    } else if (!hasRole && !this.hasView && this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  private checkRoles(): boolean {
    if (!this.roles) return true;

    const roleArray = Array.isArray(this.roles) 
      ? this.roles 
      : [this.roles];

    if (roleArray.length === 0) return true;

    if (this.requireAll) {
      return roleArray.every(role => this.authService.hasRole(role));
    } else {
      return this.authService.hasAnyRole(roleArray);
    }
  }
}

/**
 * Attribute directive to disable elements based on permissions
 * 
 * Usage examples:
 * [disableIfNoPermission]="'Users:delete'" - Disable if no permission
 * [disableIfNoPermission]="['Users:delete', 'Users:edit']" - Disable if no permissions
 */
@Directive({
  selector: '[disableIfNoPermission]',
  standalone: true
})
export class DisableIfNoPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input('disableIfNoPermission') permissions: string | string[] = [];

  constructor(
    private element: any, // ElementRef would be imported from @angular/core
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateElement();
      });
    
    // Initial check
    this.updateElement();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateElement(): void {
    const hasPermission = this.checkPermissions();
    
    if (this.element?.nativeElement) {
      this.element.nativeElement.disabled = !hasPermission;
      
      if (!hasPermission) {
        this.element.nativeElement.classList.add('disabled');
        this.element.nativeElement.setAttribute('title', 'You do not have permission to perform this action');
      } else {
        this.element.nativeElement.classList.remove('disabled');
        this.element.nativeElement.removeAttribute('title');
      }
    }
  }

  private checkPermissions(): boolean {
    if (!this.permissions) return true;

    const permissionArray = Array.isArray(this.permissions) 
      ? this.permissions 
      : [this.permissions];

    return this.authService.hasAnyPermission(permissionArray);
  }
}