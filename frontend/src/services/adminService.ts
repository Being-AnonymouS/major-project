import { apiClient } from './apiClient';
import {
  AdminStats,
  UserListItem,
  AdminUserFilters,
  AdminAppointmentFilters,
  PaginatedResponse,
  UserStatusUpdate,
} from '../types/admin';
import { Appointment } from '../types/appointment';

class AdminService {
  async getStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>('/admin/stats');
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    filters: AdminUserFilters = {}
  ): Promise<PaginatedResponse<UserListItem>> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get<PaginatedResponse<UserListItem>>('/admin/users', params);
  }

  async getAppointments(
    page: number = 1,
    limit: number = 10,
    filters: AdminAppointmentFilters = {}
  ): Promise<PaginatedResponse<Appointment>> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get<PaginatedResponse<Appointment>>('/admin/appointments', params);
  }

  async updateUserStatus(userId: string, update: UserStatusUpdate): Promise<UserListItem> {
    return apiClient.put<UserListItem>(`/admin/users/${userId}/status`, update);
  }

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${userId}`);
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`/admin/appointments/${appointmentId}/cancel`);
  }
}

export const adminService = new AdminService();