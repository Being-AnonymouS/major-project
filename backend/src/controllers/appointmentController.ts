import { Request, Response } from 'express';
import { appointmentService } from '../services/appointmentService';

export class AppointmentController {
  // Create a new appointment request
  async createAppointment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { mentorId, datetime } = req.body;
      const menteeId = req.user!.userId;

      console.log('🔍 Appointment creation request:', { mentorId, datetime, menteeId });

      // Validate required fields
      if (!mentorId || !datetime) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Mentor ID and datetime are required',
            code: 'MISSING_FIELDS'
          }
        });
      }

      // Validate that user is a mentee
      if (req.user!.role !== 'MENTEE') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only mentees can create appointment requests',
            code: 'UNAUTHORIZED_ROLE'
          }
        });
      }

      // Validate datetime format
      const appointmentDate = new Date(datetime);
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid datetime format',
            code: 'INVALID_DATETIME'
          }
        });
      }

      // Check if datetime is in the future
      if (appointmentDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Appointment must be scheduled for a future date',
            code: 'INVALID_DATETIME'
          }
        });
      }

      console.log('📅 Parsed appointment date:', appointmentDate.toISOString());
      console.log('� Parsed appointment date (local):', appointmentDate.toString());
      console.log('�🗓️ Day of week:', appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }));
      console.log('⏰ Time:', appointmentDate.toTimeString().slice(0, 5));
      console.log('🌍 Timezone offset:', appointmentDate.getTimezoneOffset());

      const appointment = await appointmentService.createAppointment(
        menteeId,
        mentorId,
        appointmentDate
      );

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment request created successfully'
      });
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error.message);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to create appointment',
          code: 'APPOINTMENT_CREATION_FAILED'
        }
      });
    }
  }

  // Get user's appointments
  async getUserAppointments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const appointments = await appointmentService.getUserAppointments(userId, userRole);

      res.json({
        success: true,
        data: appointments
      });
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch appointments',
          code: 'FETCH_APPOINTMENTS_FAILED'
        }
      });
    }
  }

  // Accept an appointment (mentor only)
  async acceptAppointment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const mentorId = req.user!.userId;

      // Validate that user is a mentor
      if (req.user!.role !== 'MENTOR') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only mentors can accept appointments',
            code: 'UNAUTHORIZED_ROLE'
          }
        });
      }

      const appointment = await appointmentService.acceptAppointment(id, mentorId);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment accepted successfully'
      });
    } catch (error: any) {
      console.error('Error accepting appointment:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message || 'Failed to accept appointment',
          code: 'ACCEPT_APPOINTMENT_FAILED'
        }
      });
    }
  }

  // Reject an appointment (mentor only)
  async rejectAppointment(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const mentorId = req.user!.userId;

      // Validate that user is a mentor
      if (req.user!.role !== 'MENTOR') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only mentors can reject appointments',
            code: 'UNAUTHORIZED_ROLE'
          }
        });
      }

      const appointment = await appointmentService.rejectAppointment(id, mentorId);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment rejected successfully'
      });
    } catch (error: any) {
      console.error('Error rejecting appointment:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message || 'Failed to reject appointment',
          code: 'REJECT_APPOINTMENT_FAILED'
        }
      });
    }
  }

  // Complete an appointment
  async completeAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const appointment = await appointmentService.completeAppointment(id, userId);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment completed successfully'
      });
    } catch (error: any) {
      console.error('Error completing appointment:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message || 'Failed to complete appointment',
          code: 'COMPLETE_APPOINTMENT_FAILED'
        }
      });
    }
  }

  // Cancel an appointment
  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const appointment = await appointmentService.cancelAppointment(id, userId);

      res.json({
        success: true,
        data: appointment,
        message: 'Appointment cancelled successfully'
      });
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message || 'Failed to cancel appointment',
          code: 'CANCEL_APPOINTMENT_FAILED'
        }
      });
    }
  }

  // Get mentor's available slots
  async getMentorAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;

      const availability = await appointmentService.getMentorAvailableSlots(mentorId);

      res.json({
        success: true,
        data: availability
      });
    } catch (error: any) {
      console.error('Error fetching mentor availability:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to fetch mentor availability',
          code: 'FETCH_AVAILABILITY_FAILED'
        }
      });
    }
  }
}

export const appointmentController = new AppointmentController();