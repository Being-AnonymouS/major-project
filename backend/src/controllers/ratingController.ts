import { Request, Response } from 'express';
import { ratingService } from '../services/ratingService';

export class RatingController {
  /**
   * Submit a rating for a completed appointment
   * POST /api/ratings
   */
  async submitRating(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId, score, comments } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      // Validate required fields
      if (!appointmentId || !score) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Appointment ID and score are required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      // Validate score range
      if (typeof score !== 'number' || score < 1 || score > 5) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Score must be a number between 1 and 5',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const rating = await ratingService.submitRating(
        appointmentId,
        userId,
        score,
        comments
      );

      res.status(201).json({
        success: true,
        data: rating,
        message: 'Rating submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      
      if (error instanceof Error) {
        // Handle specific business logic errors
        if (
          error.message.includes('not found') ||
          error.message.includes('completed') ||
          error.message.includes('already exists') ||
          error.message.includes('Only the mentee')
        ) {
          res.status(400).json({
            success: false,
            error: {
              message: error.message,
              code: 'BUSINESS_LOGIC_ERROR',
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to submit rating',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get all ratings for a specific mentor
   * GET /api/ratings/mentor/:mentorId
   */
  async getMentorRatings(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;

      if (!mentorId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Mentor ID is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const ratings = await ratingService.getMentorRatings(mentorId);

      res.json({
        success: true,
        data: ratings,
      });
    } catch (error) {
      console.error('Error fetching mentor ratings:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch mentor ratings',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get rating statistics for a mentor
   * GET /api/ratings/mentor/:mentorId/stats
   */
  async getMentorRatingStats(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;

      if (!mentorId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Mentor ID is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const stats = await ratingService.getMentorRatingStats(mentorId);

      // Transform to match frontend expectations
      const transformedStats = {
        averageRating: stats.average || 0,
        totalRatings: stats.totalRatings,
        ratingDistribution: stats.distribution,
      };

      res.json({
        success: true,
        data: transformedStats,
      });
    } catch (error) {
      console.error('Error fetching mentor rating stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch mentor rating statistics',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Check if user can rate a specific appointment
   * GET /api/ratings/appointment/:appointmentId/can-rate
   */
  async canRateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      if (!appointmentId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Appointment ID is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const canRate = await ratingService.canRateAppointment(appointmentId, userId);

      res.json({
        success: true,
        data: { canRate },
      });
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to check rating eligibility',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get rating for a specific appointment
   * GET /api/ratings/appointment/:appointmentId
   */
  async getAppointmentRating(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Appointment ID is required',
            code: 'VALIDATION_ERROR',
          },
        });
        return;
      }

      const rating = await ratingService.getAppointmentRating(appointmentId);

      res.json({
        success: true,
        data: rating,
      });
    } catch (error) {
      console.error('Error fetching appointment rating:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch appointment rating',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}

export const ratingController = new RatingController();