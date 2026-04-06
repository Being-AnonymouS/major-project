import { User } from './auth';

export interface AdminStats {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
}

export interface UserListItem extends User {
  createdAt: string;
  appointmentCount: number;
  lastActive?: string;
}

export interface AdminUserFilters {
  role?: 'MENTOR' | 'MENTEE' | 'ADMIN';
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'appointmentCount';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminAppointmentFilters {
  status?: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'datetime' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStatusUpdate {
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}