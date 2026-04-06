export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MENTOR' | 'MENTEE' | 'ADMIN';
  expertise?: string;  // Changed from string[] to string (comma-separated values)
  bio?: string;
  yearsExperience?: number;
  availabilitySlots?: TimeSlot[];
  ratingAverage?: number;
  institute?: string;
  course?: string;
  goals?: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'MENTOR' | 'MENTEE';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}