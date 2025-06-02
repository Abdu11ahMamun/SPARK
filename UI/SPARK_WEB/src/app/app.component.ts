import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ResponsiveHelperComponent } from './shared/components/responsive-helper/responsive-helper.component';
import { ThemeService } from './core/services/theme.service';


@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [RouterOutlet, SidebarComponent, NavbarComponent, ResponsiveHelperComponent, NgxSonnerToaster],
  imports: [RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'SPARK_WEB';
  constructor(public themeService: ThemeService) {}
}
