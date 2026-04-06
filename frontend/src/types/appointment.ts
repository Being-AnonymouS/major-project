import { User } from './auth';

export interface Appointment {
  id: string;
  mentorId: string;
  menteeId: string;
  datetime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  mentor: User;
  mentee: User;
}

export type AppointmentStatus = 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface CreateAppointmentRequest {
  mentorId: string;
  datetime: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  role?: 'mentor' | 'mentee';
}

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
}