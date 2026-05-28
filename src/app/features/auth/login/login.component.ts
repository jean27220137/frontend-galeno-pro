import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';
import { Divider } from 'primeng/divider';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Password,
    Button,
    Message,
    FloatLabel,
    Divider,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb           = inject(FormBuilder);
  private readonly authService  = inject(AuthService);
  private readonly router       = inject(Router);
  private readonly notify       = inject(NotificationService);

  isLoading = signal(false);
  errorMsg  = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get username() { return this.form.get('username')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notify.success('Bienvenido', 'Acceso exitoso al sistema');
        this.router.navigate(['/farmacia']); // PRESENTACIÓN: restaurar '/dashboard'
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.message ?? 'Error al iniciar sesión');
      },
    });
  }
}
