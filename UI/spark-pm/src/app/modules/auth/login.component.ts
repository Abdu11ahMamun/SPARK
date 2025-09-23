import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  returnUrl: string | null = null;
  form!: ReturnType<LoginComponent['buildForm']>; // initialized in ngOnInit
  currentYear = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  private buildForm() {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
  console.debug('[LoginComponent] init, isAuthenticated=', this.auth.isAuthenticated());
  this.form = this.buildForm();
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    console.debug('[LoginComponent] returnUrl param=', this.returnUrl);
  }

  async submit() {
    this.error.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { username, password } = this.form.value;
    this.loading.set(true);
    try {
      await this.auth.login(username!, password!);
      console.debug('[LoginComponent] login success, navigating to', this.returnUrl || '/');
      this.router.navigate([this.returnUrl || '/']);
    } catch (e: any) {
      console.debug('[LoginComponent] login failed', e);
      this.error.set(e?.status === 401 ? 'Invalid credentials' : 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
