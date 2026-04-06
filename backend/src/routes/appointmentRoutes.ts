import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';
import { authenticateWithRefresh } from '../middleware/tokenRefresh';
import { validateAppointmentCreation, validateAppointmentId } from '../middleware/validation';
import { appointmentRateLimit } from '../middleware/rateLimiter';

const router = Router();

// All appointment routes require authentication with refresh capability
router.use(authenticateWithRefresh);

// Create a new appointment request (mentee only)
router.post('/', appointmentRateLimit, validateAppointmentCreation, appointmentController.createAppointment);

// Get user's appointments
router.get('/', appointmentController.getUserAppointments);

// Accept an appointment (mentor only)
router.put('/:id/accept', validateAppointmentId, appointmentController.acceptAppointment);

// Reject an appointment (mentor only)
router.put('/:id/reject', validateAppointmentId, appointmentController.rejectAppointment);

// Complete an appointment
router.put('/:id/complete', validateAppointmentId, appointmentController.completeAppointment);

// Cancel an appointment
router.delete('/:id', validateAppointmentId, appointmentController.cancelAppointment);

// Get mentor's availability
router.get('/mentor/:mentorId/availability', appointmentController.getMentorAvailability);

export default router;