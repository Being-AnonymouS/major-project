import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

/**
 * Middleware to verify user has access to the appointment for messaging
 */
export const verifyAppointmentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
      });
      return;
    }

    const appointmentId = req.params.appointmentId || req.body.appointmentId;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Appointment ID is required',
          code: 'MISSING_APPOINTMENT_ID',
        },
      });
      return;
    }

    // Check if appointment exists and user is part of it
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        mentorId: true,
        menteeId: true,
        status: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Appointment not found',
          code: 'APPOINTMENT_NOT_FOUND',
        },
      });
      return;
    }

    // Verify user is either mentor or mentee of this appointment, or is an admin
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    if (userRole !== 'ADMIN' && appointment.mentorId !== userId && appointment.menteeId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. You are not part of this appointment',
          code: 'ACCESS_DENIED',
        },
      });
      return;
    }

    // Allow messaging for accepted appointments, and read-only access for completed appointments
    if (appointment.status !== 'ACCEPTED' && appointment.status !== 'COMPLETED') {
      res.status(403).json({
        success: false,
        error: {
          message: 'Messaging is only allowed for accepted or completed appointments',
          code: 'APPOINTMENT_NOT_ACCESSIBLE',
        },
      });
      return;
    }

    // Add appointment info to request for use in controller
    req.appointment = appointment;
    next();
  } catch (error) {
    console.error('Error verifying appointment access:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * Middleware to verify user has access to view conversations
 */
export const verifyConversationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
      });
      return;
    }

    // User can only view their own conversations
    // This will be handled in the controller by filtering appointments
    next();
  } catch (error) {
    console.error('Error verifying conversation access:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

// Extend Express Request interface to include appointment
declare global {
  namespace Express {
    interface Request {
      appointment?: {
        id: string;
        mentorId: string;
        menteeId: string;
        status: string;
      };
    }
  }
}