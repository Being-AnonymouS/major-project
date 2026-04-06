import { User } from './auth';

export interface Rating {
  id: string;
  appointmentId: string;
  raterId: string;
  ratedId: string;
  score: number;
  comments?: string;
  createdAt: string;
}

export interface RatingWithUsers extends Rating {
  rater: User;
  rated: User;
}

export interface CreateRatingRequest {
  appointmentId: string;
  score: number;
  comments?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CanRateResponse {
  canRate: boolean;
  reason?: string;
}