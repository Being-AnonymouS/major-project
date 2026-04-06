// Database types based on Prisma schema

export type UserRole = 'MENTOR' | 'MENTEE' | 'ADMIN';

export type AppointmentStatus = 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  
  // Mentor-specific fields
  expertise?: string | null;
  bio?: string | null;
  yearsExperience?: number | null;
  availabilitySlots?: string | null; // JSON string of TimeSlot[]
  ratingAverage?: number | null;
  
  // Mentee-specific fields
  institute?: string | null;
  course?: string | null;
  goals?: string | null;
}

export interface Appointment {
  id: string;
  mentorId: string;
  menteeId: string;
  datetime: Date;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  appointmentId: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: Date;
}

export interface Rating {
  id: string;
  appointmentId: string;
  raterId: string;
  ratedId: string;
  score: number;
  comments?: string | null;
  createdAt: Date;
}

// Helper types for API responses
export interface UserWithoutPassword extends Omit<User, 'password'> {}

// Transformed user interface with parsed JSON fields
export interface TransformedUser extends Omit<UserWithoutPassword, 'expertise' | 'availabilitySlots'> {
  expertise?: string[];
  availabilitySlots?: TimeSlot[];
}

export interface AppointmentWithUsers extends Appointment {
  mentor: UserWithoutPassword;
  mentee: UserWithoutPassword;
}

export interface MessageWithUsers extends Message {
  from: UserWithoutPassword;
  to: UserWithoutPassword;
}

export interface RatingWithUsers extends Rating {
  rater: UserWithoutPassword;
  rated: UserWithoutPassword;
}