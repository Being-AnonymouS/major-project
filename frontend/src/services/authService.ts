import { apiClient } from './apiClient';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },
};