import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sprint-details-org',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sprint-details-org.component.html',
  styleUrls: ['./sprint-details-org.component.scss']
})
export class SprintDetailsOrgComponent implements OnInit {
  sprintId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sprintId = this.route.snapshot.paramMap.get('id');
  }
}
