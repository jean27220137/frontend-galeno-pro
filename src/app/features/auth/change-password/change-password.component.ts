import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np === cp ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Password, Button, FloatLabel],
  template: `
    <div class="gp-page-container tw-max-w-lg tw-mx-auto">
      <div class="gp-card">
        <div class="gp-card-header">
          <h2 class="tw-text-lg tw-font-semibold tw-text-[#1e293b] tw-m-0">
            <i class="pi pi-key tw-mr-2 tw-text-[#2378f0]"></i>Cambiar Contraseña
          </h2>
        </div>
        <div class="gp-card-body">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="tw-flex tw-flex-col tw-gap-5">

              <p-floatlabel variant="on">
                <p-password inputId="current" formControlName="currentPassword"
                  [feedback]="false" [toggleMask]="true" styleClass="tw-w-full" />
                <label for="current">Contraseña actual</label>
              </p-floatlabel>

              <p-floatlabel variant="on">
                <p-password inputId="new" formControlName="newPassword"
                  [toggleMask]="true" styleClass="tw-w-full" />
                <label for="new">Nueva contraseña</label>
              </p-floatlabel>

              <p-floatlabel variant="on">
                <p-password inputId="confirm" formControlName="confirmPassword"
                  [feedback]="false" [toggleMask]="true" styleClass="tw-w-full" />
                <label for="confirm">Confirmar nueva contraseña</label>
              </p-floatlabel>

              @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <small class="tw-text-red-500">Las contraseñas no coinciden.</small>
              }

              <div class="tw-flex tw-gap-3 tw-justify-end">
                <p-button label="Cancelar" severity="secondary" outlined
                  (onClick)="router.navigate(['/dashboard'])" />
                <p-button type="submit" label="Guardar Cambios" icon="pi pi-save"
                  [loading]="isLoading()" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly router              = inject(Router);
  private readonly notify      = inject(NotificationService);

  isLoading = signal(false);

  form: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.authService.changePassword(this.form.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notify.success('Contraseña actualizada', 'Su contraseña fue cambiada exitosamente');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.notify.error('Error', 'No se pudo cambiar la contraseña');
      },
    });
  }
}
