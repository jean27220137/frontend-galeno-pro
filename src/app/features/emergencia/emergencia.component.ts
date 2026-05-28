import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emergencia',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="tw-flex tw-flex-col tw-min-h-[calc(100vh-64px)]">
      <nav class="gp-subnav">
        <div class="gp-subnav__inner">
          <span class="gp-subnav__module"><i class="pi pi-bolt tw-text-red-500"></i> Emergencia</span>
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="gp-subnav__link--active" class="gp-subnav__link">
              <i [class]="l.icon"></i>{{ l.label }}
            </a>
          }
        </div>
      </nav>
      <div class="gp-page-container tw-flex-1 gp-fade-in"><router-outlet /></div>
    </div>
  `,
  styles: [`
    .gp-subnav{background:white;border-bottom:1px solid #e2e8f0;position:sticky;top:64px;z-index:90;}
    .gp-subnav__inner{display:flex;align-items:center;gap:.5rem;padding:0 1.5rem;height:48px;overflow-x:auto;}
    .gp-subnav__module{display:flex;align-items:center;gap:.375rem;font-weight:700;font-size:.875rem;
      color:#1e293b;white-space:nowrap;padding-right:.75rem;border-right:1px solid #e2e8f0;margin-right:.25rem;}
    .gp-subnav__link{display:flex;align-items:center;gap:.375rem;padding:.375rem .75rem;border-radius:.375rem;
      font-size:.8125rem;font-weight:500;color:#64748b;text-decoration:none;white-space:nowrap;transition:all .15s;}
    .gp-subnav__link:hover{background:#f1f5f9;color:#1e293b;}
    .gp-subnav__link--active{background:#fee2e2;color:#dc2626;font-weight:600;}
  `],
})
export class EmergenciaComponent {
  links = [
    { path: 'admision',    label: 'Admisión',    icon: 'pi pi-sign-in' },
    { path: 'triage',      label: 'Triage',      icon: 'pi pi-heart-fill' },
    { path: 'observacion', label: 'Observación', icon: 'pi pi-eye' },
  ];
}
