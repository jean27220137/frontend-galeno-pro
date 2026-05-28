import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="gp-main-content" role="main">
      <router-outlet />
    </main>
  `,
  styles: [`
    .gp-main-content {
      margin-top: var(--navbar-height);
      min-height: calc(100vh - var(--navbar-height));
      background: var(--gp-bg);
    }
  `],
})
export class MainLayoutComponent {}
