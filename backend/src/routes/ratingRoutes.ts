import { Router } from 'express';
import { ratingController } from '../controllers/ratingController';
import { authenticateToken } from '../middleware/auth';
import { validateRatingSubmission } from '../middleware/validation';

const router = Router();

// All rating routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/ratings
 * @desc Submit a rating for a completed appointment
 * @access Private (Mentee only)
 */
router.post('/', validateRatingSubmission, ratingController.submitRating);

/**
 * @route GET /api/ratings/mentor/:mentorId
 * @desc Get all ratings for a specific mentor
 * @access Private
 */
router.get('/mentor/:mentorId', ratingController.getMentorRatings);

/**
 * @route GET /api/ratings/mentor/:mentorId/stats
 * @desc Get rating statistics for a mentor
 * @access Private
 */
router.get('/mentor/:mentorId/stats', ratingController.getMentorRatingStats);

/**
 * @route GET /api/ratings/appointment/:appointmentId/can-rate
 * @desc Check if user can rate a specific appointment
 * @access Private
 */
router.get('/appointment/:appointmentId/can-rate', ratingController.canRateAppointment);

/**
 * @route GET /api/ratings/appointment/:appointmentId
 * @desc Get rating for a specific appointment
 * @access Private
 */
router.get('/appointment/:appointmentId', ratingController.getAppointmentRating);

export default router;