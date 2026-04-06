import { apiClient } from './apiClient';
import { User } from '../types/auth';

export interface UpdateProfileData {
  name?: string;
  expertise?: string; // Changed from string[] to string for consistency
  bio?: string;
  yearsExperience?: number;
  availabilitySlots?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  institute?: string;
  course?: string;
  goals?: string;
}

class UserService {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/users/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    // Expertise is already a comma-separated string
    return apiClient.put<User>('/users/profile', data);
  }

  async getMentors(filters?: {
    expertise?: string; // Changed from string[] to string for consistency
    availability?: boolean;
    page?: number;
    limit?: number;
  }): Promise<User[]> {
    const params: any = {};
    
    if (filters?.expertise) {
      params.expertise = filters.expertise;
    }
    
    if (filters?.availability !== undefined) {
      params.availability = filters.availability;
    }
    
    if (filters?.page) {
      params.page = filters.page;
    }
    
    if (filters?.limit) {
      params.limit = filters.limit;
    }

    const response = await apiClient.get<{
      mentors: User[];
      total: number;
      page: number;
      totalPages: number;
    }>('/users/mentors', params);
    
    return response.mentors;
  }

  async getMentorById(id: string): Promise<User> {
    const response = await apiClient.get<{ mentor: User }>(`/users/mentors/${id}`);
    return response.mentor;
  }
}

export const userService = new UserService();