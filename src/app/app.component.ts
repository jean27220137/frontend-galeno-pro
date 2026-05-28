import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  template: `
    <p-toast position="top-right" [life]="4000" />
    <router-outlet />
  `,
})
export class AppComponent {
  readonly title = 'Galenos Pro';
}
