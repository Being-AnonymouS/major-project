import { http, HttpResponse } from 'msw';
import { User } from '../../types/auth';
import { Appointment } from '../../types/appointment';
import { Message } from '../../types/message';
import { Rating } from '../../types/rating';

// Mock data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'MENTEE',
  institute: 'Test University',
  course: 'Computer Science',
  goals: 'Learn web development',
};

const mockMentor: User = {
  id: '2',
  email: 'mentor@example.com',
  name: 'Test Mentor',
  role: 'MENTOR',
  expertise: 'JavaScript,React',
  bio: 'Experienced developer',
  yearsExperience: 5,
  ratingAverage: 4.5,
  availabilitySlots: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
  ],
};

const mockAppointment: Appointment = {
  id: '1',
  mentorId: '2',
  menteeId: '1',
  datetime: '2024-01-15T10:00:00Z',
  status: 'ACCEPTED',
  createdAt: '2024-01-14T10:00:00Z',
  updatedAt: '2024-01-14T10:00:00Z',
  mentor: mockMentor,
  mentee: mockUser,
};

const mockMessage: Message = {
  id: '1',
  appointmentId: '1',
  fromId: '1',
  toId: '2',
  text: 'Hello, looking forward to our session!',
  timestamp: '2024-01-14T15:30:00Z',
  from: mockUser,
  to: mockMentor,
};

const mockRating: Rating = {
  id: '1',
  appointmentId: '1',
  raterId: '1',
  ratedId: '2',
  score: 5,
  comments: 'Great session!',
  createdAt: '2024-01-14T16:00:00Z',
};

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
      },
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
      },
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // User endpoints
  http.get('/api/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  http.put('/api/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  http.get('/api/users/mentors', () => {
    return HttpResponse.json({
      success: true,
      data: [mockMentor],
    });
  }),

  http.get('/api/users/mentors/:id', () => {
    return HttpResponse.json({
      success: true,
      data: mockMentor,
    });
  }),

  // Appointment endpoints
  http.get('/api/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: [mockAppointment],
    });
  }),

  http.post('/api/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: mockAppointment,
    });
  }),

  http.put('/api/appointments/:id/accept', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockAppointment, status: 'ACCEPTED' },
    });
  }),

  http.put('/api/appointments/:id/reject', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockAppointment, status: 'CANCELLED' },
    });
  }),

  http.put('/api/appointments/:id/complete', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockAppointment, status: 'COMPLETED' },
    });
  }),

  http.delete('/api/appointments/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Appointment cancelled',
    });
  }),

  // Message endpoints
  http.get('/api/messages/:appointmentId', () => {
    return HttpResponse.json({
      success: true,
      data: [mockMessage],
    });
  }),

  http.post('/api/messages', () => {
    return HttpResponse.json({
      success: true,
      data: mockMessage,
    });
  }),

  http.get('/api/messages/conversations', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          appointmentId: '1',
          otherUser: mockMentor,
          lastMessage: mockMessage,
          unreadCount: 0,
        },
      ],
    });
  }),

  // Rating endpoints
  http.post('/api/ratings', () => {
    return HttpResponse.json({
      success: true,
      data: mockRating,
    });
  }),

  http.get('/api/ratings/mentor/:id', () => {
    return HttpResponse.json({
      success: true,
      data: [mockRating],
    });
  }),

  // Admin endpoints
  http.get('/api/admin/users', () => {
    return HttpResponse.json({
      success: true,
      data: {
        users: [mockUser, mockMentor],
        total: 2,
        page: 1,
        totalPages: 1,
      },
    });
  }),

  http.get('/api/admin/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: {
        appointments: [mockAppointment],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });
  }),

  http.get('/api/admin/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalUsers: 2,
        totalMentors: 1,
        totalMentees: 1,
        totalAppointments: 1,
        completedAppointments: 0,
        pendingAppointments: 1,
      },
    });
  }),
];