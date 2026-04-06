import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AppointmentService } from '../../services/appointmentService';
import prisma from '../../utils/prisma';

// Mock dependencies
jest.mock('../../utils/prisma', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
    },
    appointment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;

  beforeEach(() => {
    appointmentService = new AppointmentService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockMentor = {
    id: '2',
    name: 'Test Mentor',
    email: 'mentor@example.com',
    role: 'MENTOR',
    expertise: ['JavaScript', 'React'],
    bio: 'Experienced developer',
    yearsExperience: 5,
    ratingAverage: 4.5,
    availabilitySlots: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    ],
  };

  const mockMentee = {
    id: '1',
    name: 'Test Mentee',
    email: 'mentee@example.com',
    role: 'MENTEE',
    institute: 'Test University',
    course: 'Computer Science',
    goals: 'Learn web development',
  };

  const mockAppointment = {
    id: '1',
    mentorId: '2',
    menteeId: '1',
    datetime: new Date('2024-01-15T10:00:00Z'),
    status: 'REQUESTED',
    mentor: mockMentor,
    mentee: mockMentee,
  };

  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(mockMentor);
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.create.mockResolvedValue(mockAppointment);
      
      // Mock checkMentorAvailability method
      jest.spyOn(appointmentService, 'checkMentorAvailability' as any).mockResolvedValue(true);

      const result = await appointmentService.createAppointment(
        '1',
        '2',
        new Date('2024-01-15T10:00:00Z')
      );

      expect(result).toEqual(mockAppointment);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '2', role: 'MENTOR' },
      });
      expect(mockPrisma.appointment.create).toHaveBeenCalledWith({
        data: {
          menteeId: '1',
          mentorId: '2',
          datetime: new Date('2024-01-15T10:00:00Z'),
          status: 'REQUESTED',
        },
        include: expect.any(Object),
      });
    });

    it('should throw error if mentor not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        appointmentService.createAppointment('1', '2', new Date('2024-01-15T10:00:00Z'))
      ).rejects.toThrow('Mentor not found');
    });

    it('should throw error if mentor not available', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockMentor);
      jest.spyOn(appointmentService, 'checkMentorAvailability' as any).mockResolvedValue(false);

      await expect(
        appointmentService.createAppointment('1', '2', new Date('2024-01-15T10:00:00Z'))
      ).rejects.toThrow('Mentor is not available at the requested time');
    });

    it('should throw error if time slot already booked', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockMentor);
      jest.spyOn(appointmentService, 'checkMentorAvailability' as any).mockResolvedValue(true);
      mockPrisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      await expect(
        appointmentService.createAppointment('1', '2', new Date('2024-01-15T10:00:00Z'))
      ).rejects.toThrow('Time slot is already booked');
    });
  });

  describe('getUserAppointments', () => {
    it('should get appointments for mentor', async () => {
      mockPrisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      const result = await appointmentService.getUserAppointments('2', 'MENTOR');

      expect(result).toEqual([mockAppointment]);
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: { mentorId: '2' },
        include: expect.any(Object),
        orderBy: { datetime: 'asc' },
      });
    });

    it('should get appointments for mentee', async () => {
      mockPrisma.appointment.findMany.mockResolvedValue([mockAppointment]);

      const result = await appointmentService.getUserAppointments('1', 'MENTEE');

      expect(result).toEqual([mockAppointment]);
      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith({
        where: { menteeId: '1' },
        include: expect.any(Object),
        orderBy: { datetime: 'asc' },
      });
    });
  });

  describe('acceptAppointment', () => {
    it('should accept appointment successfully', async () => {
      const acceptedAppointment = { ...mockAppointment, status: 'ACCEPTED' };
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.update.mockResolvedValue(acceptedAppointment);

      const result = await appointmentService.acceptAppointment('1', '2');

      expect(result).toEqual(acceptedAppointment);
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'ACCEPTED' },
        include: expect.any(Object),
      });
    });

    it('should throw error if appointment not found', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(appointmentService.acceptAppointment('1', '2')).rejects.toThrow(
        'Appointment not found'
      );
    });

    it('should throw error if unauthorized mentor', async () => {
      const unauthorizedAppointment = { ...mockAppointment, mentorId: '3' };
      mockPrisma.appointment.findUnique.mockResolvedValue(unauthorizedAppointment);

      await expect(appointmentService.acceptAppointment('1', '2')).rejects.toThrow(
        'Unauthorized: You can only accept your own appointments'
      );
    });

    it('should throw error if appointment not in requested status', async () => {
      const acceptedAppointment = { ...mockAppointment, status: 'ACCEPTED' };
      mockPrisma.appointment.findUnique.mockResolvedValue(acceptedAppointment);

      await expect(appointmentService.acceptAppointment('1', '2')).rejects.toThrow(
        'Appointment cannot be accepted in its current status'
      );
    });
  });


});