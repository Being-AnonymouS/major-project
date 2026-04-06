import { apiClient } from './apiClient';
import { Appointment, CreateAppointmentRequest, AppointmentFilters } from '../types/appointment';

export class AppointmentService {
  private static readonly BASE_URL = '/appointments';

  static async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(this.BASE_URL, filters);
  }

  static async getAppointment(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`${this.BASE_URL}/${id}`);
  }

  static async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>(this.BASE_URL, data);
  }

  static async acceptAppointment(id: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`${this.BASE_URL}/${id}/accept`);
  }

  static async rejectAppointment(id: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`${this.BASE_URL}/${id}/reject`);
  }

  static async completeAppointment(id: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`${this.BASE_URL}/${id}/complete`);
  }

  static async cancelAppointment(id: string): Promise<Appointment> {
    return apiClient.delete<Appointment>(`${this.BASE_URL}/${id}`);
  }
}