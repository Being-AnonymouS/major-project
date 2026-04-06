import prisma from '../utils/prisma';
import { Rating, RatingWithUsers } from '../types/database';

export class RatingService {
  /**
   * Submit a rating for a completed appointment
   * Validates that the appointment is completed and no duplicate rating exists
   */
  async submitRating(
    appointmentId: string,
    raterId: string,
    score: number,
    comments?: string
  ): Promise<Rating> {
    // Validate appointment exists and is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        mentor: true,
        mentee: true,
        rating: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new Error('Can only rate completed appointments');
    }

    // Check if rating already exists (duplicate prevention)
    if (appointment.rating) {
      throw new Error('Rating already exists for this appointment');
    }

    // Validate that the rater is the mentee
    if (appointment.menteeId !== raterId) {
      throw new Error('Only the mentee can rate the appointment');
    }

    // Validate score range
    if (score < 1 || score > 5) {
      throw new Error('Rating score must be between 1 and 5');
    }

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        appointmentId,
        raterId,
        ratedId: appointment.mentorId,
        score,
        comments: comments || null,
      },
    });

    // Update mentor's average rating
    await this.updateMentorRating(appointment.mentorId);

    return rating as Rating;
  }

  /**
   * Calculate and update mentor's average rating
   */
  async updateMentorRating(mentorId: string): Promise<void> {
    // Get all ratings for this mentor
    const ratings = await prisma.rating.findMany({
      where: { ratedId: mentorId },
    });

    if (ratings.length === 0) {
      // No ratings yet, set to null
      await prisma.user.update({
        where: { id: mentorId },
        data: { ratingAverage: null },
      });
      return;
    }

    // Calculate average
    const totalScore = ratings.reduce((sum: number, rating: any) => sum + rating.score, 0);
    const average = totalScore / ratings.length;

    // Update mentor's rating average (rounded to 2 decimal places)
    await prisma.user.update({
      where: { id: mentorId },
      data: { ratingAverage: Math.round(average * 100) / 100 },
    });
  }

  /**
   * Get all ratings for a specific mentor
   */
  async getMentorRatings(mentorId: string): Promise<RatingWithUsers[]> {
    const ratings = await prisma.rating.findMany({
      where: { ratedId: mentorId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            availabilitySlots: true,
            ratingAverage: true,
            institute: true,
            course: true,
            goals: true,
          },
        },
        rated: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            availabilitySlots: true,
            ratingAverage: true,
            institute: true,
            course: true,
            goals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings as RatingWithUsers[];
  }

  /**
   * Get rating statistics for a mentor
   */
  async getMentorRatingStats(mentorId: string): Promise<{
    average: number | null;
    totalRatings: number;
    distribution: { [key: number]: number };
  }> {
    const ratings = await prisma.rating.findMany({
      where: { ratedId: mentorId },
    });

    if (ratings.length === 0) {
      return {
        average: null,
        totalRatings: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalScore = ratings.reduce((sum: number, rating: any) => sum + rating.score, 0);
    const average = Math.round((totalScore / ratings.length) * 100) / 100;

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((rating: any) => {
      distribution[rating.score as keyof typeof distribution]++;
    });

    return {
      average,
      totalRatings: ratings.length,
      distribution,
    };
  }

  /**
   * Check if a user can rate a specific appointment
   */
  async canRateAppointment(appointmentId: string, userId: string): Promise<boolean> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { rating: true },
    });

    if (!appointment) {
      return false;
    }

    // Must be completed appointment
    if (appointment.status !== 'COMPLETED') {
      return false;
    }

    // Must be the mentee
    if (appointment.menteeId !== userId) {
      return false;
    }

    // Must not already have a rating
    if (appointment.rating) {
      return false;
    }

    return true;
  }

  /**
   * Get rating for a specific appointment
   */
  async getAppointmentRating(appointmentId: string): Promise<RatingWithUsers | null> {
    const rating = await prisma.rating.findUnique({
      where: { appointmentId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            availabilitySlots: true,
            ratingAverage: true,
            institute: true,
            course: true,
            goals: true,
          },
        },
        rated: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            availabilitySlots: true,
            ratingAverage: true,
            institute: true,
            course: true,
            goals: true,
          },
        },
      },
    });

    return rating as RatingWithUsers | null;
  }
}

export const ratingService = new RatingService();