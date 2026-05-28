import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-triage-emergencia', standalone: true, imports: [CommonModule],
  template: `<div class="gp-card tw-p-16 tw-flex tw-flex-col tw-items-center tw-text-[#94a3b8]">
    <i class="pi pi-heart-fill tw-text-5xl tw-mb-4 tw-text-[#2378f0]"></i>
    <h3 class="tw-font-semibold tw-text-[#1e293b] tw-mb-1">Triage Emergencia</h3>
    <p class="tw-text-sm tw-m-0">Módulo en desarrollo</p></div>`,
})
export class TriageEmergenciaComponent {}
