import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backlog-container">
      <h1>Backlog Management</h1>
      <p>Backlog module is under development.</p>
    </div>
  `,
  styles: [`
    .backlog-container {
      padding: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class BacklogComponent {

}
