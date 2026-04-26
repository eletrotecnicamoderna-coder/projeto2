/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  email: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled' | 'missed';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string; // ISO string
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
}

export interface Notification {
  id: string;
  userId: string; // Patient or Doctor ID
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'appointment_reminder' | 'appointment_canceled' | 'other';
}
