import { apiClient } from './apiClient';
import { 
  Rating, 
  RatingWithUsers, 
  CreateRatingRequest, 
  RatingStats, 
  CanRateResponse 
} from '../types/rating';

export class RatingService {
  /**
   * Submit a rating for a completed appointment
   */
  static async submitRating(request: CreateRatingRequest): Promise<Rating> {
    return apiClient.post<Rating>('/ratings', request);
  }

  /**
   * Get all ratings for a specific mentor
   */
  static async getMentorRatings(mentorId: string): Promise<RatingWithUsers[]> {
    return apiClient.get<RatingWithUsers[]>(`/ratings/mentor/${mentorId}`);
  }

  /**
   * Get rating statistics for a mentor
   */
  static async getMentorRatingStats(mentorId: string): Promise<RatingStats> {
    return apiClient.get<RatingStats>(`/ratings/mentor/${mentorId}/stats`);
  }

  /**
   * Check if user can rate a specific appointment
   */
  static async canRateAppointment(appointmentId: string): Promise<CanRateResponse> {
    return apiClient.get<CanRateResponse>(`/ratings/appointment/${appointmentId}/can-rate`);
  }

  /**
   * Get rating for a specific appointment
   */
  static async getAppointmentRating(appointmentId: string): Promise<Rating | null> {
    try {
      return await apiClient.get<Rating>(`/ratings/appointment/${appointmentId}`);
    } catch (error: any) {
      // If rating doesn't exist, return null instead of throwing error
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}