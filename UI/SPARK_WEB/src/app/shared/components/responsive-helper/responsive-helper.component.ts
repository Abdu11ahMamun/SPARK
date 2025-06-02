import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment.prod';

@Component({
  selector: 'app-responsive-helper',
  standalone: true,
  templateUrl: './responsive-helper.component.html',
  styleUrls: ['./responsive-helper.component.css'],
  imports: [NgIf],
})
export class ResponsiveHelperComponent implements OnInit {
  public env: any = environment;

  constructor() {}

  ngOnInit(): void {}
}
