import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="flex flex-col items-center justify-center py-16">
    <div class="text-6xl font-bold mb-4 text-red-500">403</div>
    <h1 class="text-2xl font-semibold mb-2">Access Denied</h1>
    <p class="mb-6 text-center max-w-xl">You don't have permission to view this page. If you believe this is an error, please contact your administrator to request the required access rights.</p>
    <a routerLink="/" class="px-5 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition">Go to Dashboard</a>
  </div>
  `,
})
export class UnauthorizedComponent {}
