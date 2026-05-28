import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Tooltip } from 'primeng/tooltip';
import { MultiSelect } from 'primeng/multiselect';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  codigo: string;
  avatar?: string;
  color: string;
  disponible: boolean;
}

export interface AsignacionMedico {
  id: number;
  medico: Medico;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  consultorio: string;
  cupos: number;
  tipo: 'CONSULTA' | 'CIRUGIA' | 'TURNO_GUARDIA';
}

@Component({
  selector: 'app-asignacion-medicos',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DatePicker, Button, Dialog, Select, Tag, Avatar, Tooltip,
    MultiSelect, FloatLabel, InputText,
  ],
  templateUrl: './asignacion-medicos.component.html',
})
export class AsignacionMedicosComponent implements OnInit {

  medicos = signal<Medico[]>([]);
  asignaciones = signal<AsignacionMedico[]>([]);
  selectedDate = signal<Date>(new Date());
  showModal = signal(false);
  isSaving  = signal(false);

  // Formulario de asignación rápida
  formData: Partial<{
    medicosSeleccionados: Medico[];
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    consultorio: string;
    cupos: number;
    tipo: string;
  }> = {};

  franjas = [
    { label: '07:00', value: '07:00' }, { label: '07:30', value: '07:30' },
    { label: '08:00', value: '08:00' }, { label: '08:30', value: '08:30' },
    { label: '09:00', value: '09:00' }, { label: '10:00', value: '10:00' },
    { label: '11:00', value: '11:00' }, { label: '12:00', value: '12:00' },
    { label: '13:00', value: '13:00' }, { label: '14:00', value: '14:00' },
    { label: '15:00', value: '15:00' }, { label: '16:00', value: '16:00' },
    { label: '17:00', value: '17:00' }, { label: '18:00', value: '18:00' },
    { label: '19:00', value: '19:00' }, { label: '20:00', value: '20:00' },
  ];

  tipoOptions = [
    { label: 'Consulta',      value: 'CONSULTA'      },
    { label: 'Cirugía',       value: 'CIRUGIA'       },
    { label: 'Turno Guardia', value: 'TURNO_GUARDIA' },
  ];

  ngOnInit(): void {
    this.medicos.set(this.getMockMedicos());
    this.asignaciones.set(this.getMockAsignaciones());
    this.formData.fecha = new Date();
  }

  get asignacionesDia(): AsignacionMedico[] {
    const d = this.selectedDate();
    return this.asignaciones().filter(a =>
      a.fecha.toDateString() === d.toDateString()
    );
  }

  onFechaChange(date: Date): void {
    this.selectedDate.set(date);
  }

  abrirAsignacion(medico?: Medico): void {
    this.formData = {
      fecha: this.selectedDate(),
      medicosSeleccionados: medico ? [medico] : [],
      cupos: 15,
    };
    this.showModal.set(true);
  }

  guardarAsignacion(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showModal.set(false);
    }, 800);
  }

  getColorMedico(id: number): string {
    const med = this.medicos().find(m => m.id === id);
    return med?.color ?? '#94a3b8';
  }

  private getMockMedicos(): Medico[] {
    return [
      { id: 1, nombre: 'Dr. Carlos Mendoza',    especialidad: 'Medicina General', codigo: 'MD-001', color: '#2378f0', disponible: true },
      { id: 2, nombre: 'Dra. Ana Torres',        especialidad: 'Pediatría',        codigo: 'MD-002', color: '#00bcd4', disponible: true },
      { id: 3, nombre: 'Dr. Luis Herrera',       especialidad: 'Cardiología',      codigo: 'MD-003', color: '#10b981', disponible: false },
      { id: 4, nombre: 'Dra. María Gutiérrez',   especialidad: 'Ginecología',      codigo: 'MD-004', color: '#f59e0b', disponible: true },
      { id: 5, nombre: 'Dr. Roberto Sánchez',    especialidad: 'Traumatología',    codigo: 'MD-005', color: '#8b5cf6', disponible: true },
      { id: 6, nombre: 'Dra. Isabel Vargas',     especialidad: 'Dermatología',     codigo: 'MD-006', color: '#ec4899', disponible: false },
    ];
  }

  private getMockAsignaciones(): AsignacionMedico[] {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    return [
      { id: 1, medico: this.getMockMedicos()[0], fecha: today, horaInicio: '08:00', horaFin: '12:00', consultorio: 'Cons. 01', cupos: 16, tipo: 'CONSULTA' },
      { id: 2, medico: this.getMockMedicos()[1], fecha: today, horaInicio: '09:00', horaFin: '13:00', consultorio: 'Cons. 02', cupos: 12, tipo: 'CONSULTA' },
      { id: 3, medico: this.getMockMedicos()[3], fecha: today, horaInicio: '14:00', horaFin: '18:00', consultorio: 'Cons. 03', cupos: 10, tipo: 'CONSULTA' },
      { id: 4, medico: this.getMockMedicos()[2], fecha: tomorrow, horaInicio: '07:00', horaFin: '19:00', consultorio: 'UCI',      cupos: 0,  tipo: 'TURNO_GUARDIA' },
    ];
  }
}
