/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'patient' | 'professional' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  cpf: string;
  address?: string;
  status: UserStatus;
  // Patient specific
  birthDate?: string;
  // Professional specific
  specialty?: string;
  crm?: string;
}

export interface Patient extends UserProfile {
  role: 'patient';
  birthDate: string;
}

export interface Doctor extends UserProfile {
  role: 'professional';
  specialty: string;
  crm: string;
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
