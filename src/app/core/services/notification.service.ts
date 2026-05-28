import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type Severity = 'success' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly msg = inject(MessageService);

  success(summary: string, detail?: string): void {
    this.msg.add({ severity: 'success', summary, detail, life: 4000 });
  }

  info(summary: string, detail?: string): void {
    this.msg.add({ severity: 'info', summary, detail, life: 4000 });
  }

  warn(summary: string, detail?: string): void {
    this.msg.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  error(summary: string, detail?: string): void {
    this.msg.add({ severity: 'error', summary, detail, life: 6000 });
  }

  clear(): void {
    this.msg.clear();
  }
}
