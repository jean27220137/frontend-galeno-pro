import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors, ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { InputText } from 'primeng/inputtext';
import { Password }  from 'primeng/password';
import { Button }    from 'primeng/button';
import { Select }    from 'primeng/select';
import { Textarea }  from 'primeng/textarea';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

import { UserService }         from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputText, Password, Button, Select, Textarea,
    IconField, InputIcon,
  ],
  templateUrl: './crear-usuario.component.html',
  styleUrl:    './crear-usuario.component.css',
})
export class CrearUsuarioComponent {
  private readonly userService = inject(UserService);
  private readonly notify      = inject(NotificationService);
  private readonly router      = inject(Router);
  private readonly fb          = inject(FormBuilder);

  isSaving    = signal(false);
  currentStep = signal(1);
  readonly totalSteps = 3;

  steps = [
    { num: 1, label: 'Datos Personales',    icon: 'pi pi-id-card'   },
    { num: 2, label: 'Datos Profesionales', icon: 'pi pi-briefcase' },
    { num: 3, label: 'Acceso y Roles',      icon: 'pi pi-shield'    },
  ];

  tiposDocumento = [
    { label: 'DNI',                  value: 'DNI' },
    { label: 'Carné de Extranjería', value: 'CARNET_EXTRANJERIA' },
    { label: 'Pasaporte',            value: 'PASAPORTE' },
  ];

  condicionesLaborales = [
    { label: 'Nombrado', value: 'NOMBRADO' },
    { label: 'CAS',      value: 'CAS'      },
    { label: 'Terceros', value: 'TERCEROS' },
  ];

  areasDisponibles = [
    { label: 'Almacén Central',                  value: 'ALMACEN_CENTRAL'       },
    { label: 'Farmacia de Emergencia',            value: 'FARMACIA_EMERGENCIA'   },
    { label: 'Farmacia de Consultorios Externos', value: 'FARMACIA_CONSULTORIOS' },
  ];

  estadosDisponibles = [
    { label: 'Activo',     value: 'ACTIVO'     },
    { label: 'Inactivo',   value: 'INACTIVO'   },
    { label: 'Suspendido', value: 'SUSPENDIDO' },
    { label: 'Vacaciones', value: 'VACACIONES' },
  ];

  rolesDisponibles = [
    { label: 'Técnico de Farmacia',  value: 'TECNICO_FARMACIA',     icon: 'pi pi-wrench' },
    { label: 'Químico Farmacéutico', value: 'QUIMICO_FARMACEUTICO', icon: 'pi pi-flask'  },
    { label: 'Jefe de Farmacia',     value: 'JEFE_FARMACIA',        icon: 'pi pi-star'   },
    { label: 'Auxiliar de Almacén',  value: 'AUXILIAR_ALMACEN',     icon: 'pi pi-box'    },
  ];

  private readonly stepFields: Record<number, string[]> = {
    1: ['tipoDocumento','numeroDocumento','nombres','apellidoPaterno','apellidoMaterno','fechaNacimiento','telefono','direccionDomicilio'],
    2: ['condicionLaboral','areaAsignada','fechaIngreso'],
    3: ['correoInstitucional','username','password','confirmPassword','estado','roles'],
  };

  form: FormGroup = this.fb.group(
    {
      /* ── Personales ── */
      tipoDocumento:       ['DNI', Validators.required],
      numeroDocumento:     ['', [Validators.required, Validators.minLength(8)]],
      nombres:             ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno:     ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno:     ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento:     ['', Validators.required],
      telefono:            ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      direccionDomicilio:  ['', Validators.required],
      /* ── Profesionales ── */
      colegiatura:         [''],
      condicionLaboral:    ['', Validators.required],
      areaAsignada:        [''],
      fechaIngreso:        ['', Validators.required],
      /* ── Acceso ── */
      correoInstitucional: ['', [Validators.required, Validators.email]],
      username:            ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      password:            ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword:     ['', Validators.required],
      estado:              ['ACTIVO', Validators.required],
      firmaDigital:        [''],
      roles:               [[], Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  get progressPct(): number {
    return ((this.currentStep() - 1) / (this.totalSteps - 1)) * 100;
  }

  isStepDone(step: number): boolean {
    return this.stepFields[step].every(f => this.form.get(f)?.valid);
  }

  nextStep(): void {
    let valid = true;
    this.stepFields[this.currentStep()].forEach(f => {
      this.form.get(f)?.markAsTouched();
      if (this.form.get(f)?.invalid) valid = false;
    });
    if (this.currentStep() === 3 && this.form.errors?.['passwordMismatch']) {
      this.form.get('confirmPassword')?.markAsTouched();
      valid = false;
    }
    if (valid && this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  onSubmit(): void {
    let valid = true;
    this.stepFields[3].forEach(f => {
      this.form.get(f)?.markAsTouched();
      if (this.form.get(f)?.invalid) valid = false;
    });
    if (this.form.errors?.['passwordMismatch']) {
      this.form.get('confirmPassword')?.markAsTouched();
      valid = false;
    }
    if (!valid) return;

    this.isSaving.set(true);
    const { confirmPassword, ...payload } = this.form.value;
    this.userService.createUser(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.notify.success('Usuario creado correctamente');
        this.form.reset({ tipoDocumento: 'DNI', estado: 'ACTIVO', roles: [] });
        this.currentStep.set(1);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notify.error(err?.error?.message ?? 'Error al crear el usuario');
      },
    });
  }

  onCancelar(): void { this.router.navigate(['/farmacia/dashboard']); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  getErrorMsg(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])  return 'Campo requerido';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.errors['email'])     return 'Correo inválido';
    if (c.errors['pattern'])   return field === 'telefono' ? 'Solo dígitos (7-15)' : 'Formato inválido';
    return '';
  }

  get passwordMismatch(): boolean {
    return !!(this.form.errors?.['passwordMismatch'] && this.form.get('confirmPassword')?.touched);
  }

  toggleRol(valor: string): void {
    const ctrl = this.form.get('roles')!;
    const current: string[] = ctrl.value ?? [];
    ctrl.setValue(
      current.includes(valor) ? current.filter(r => r !== valor) : [...current, valor],
    );
    ctrl.markAsTouched();
  }

  get esQuimico(): boolean {
    return this.form.get('roles')?.value?.includes('QUIMICO_FARMACEUTICO');
  }
}

