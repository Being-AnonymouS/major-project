import React, { useEffect, useState } from 'react';
import { RatingWithUsers, RatingStats } from '../types/rating';
import { RatingService } from '../services/ratingService';
import { StarRating } from './ui/StarRating';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface RatingDisplayProps {
  mentorId: string;
  mentorName: string;
  showStats?: boolean;
  maxReviews?: number;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  mentorId,
  mentorName,
  showStats = true,
  maxReviews = 5,
}) => {
  const [ratings, setRatings] = useState<RatingWithUsers[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [ratingsData, statsData] = await Promise.all([
          RatingService.getMentorRatings(mentorId),
          showStats ? RatingService.getMentorRatingStats(mentorId) : Promise.resolve(null),
        ]);

        setRatings(ratingsData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load ratings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatingData();
  }, [mentorId, showStats]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayedRatings = showAllReviews ? ratings : ratings.slice(0, maxReviews);
  const hasMoreReviews = ratings.length > maxReviews;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Failed to load ratings</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reviews for {mentorName}
        </h3>
        <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reviews for {mentorName}
        </h3>

        {/* Rating Statistics */}
        {showStats && stats && typeof stats.averageRating === 'number' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={stats.averageRating} size="md" />
                <p className="text-sm text-gray-600 mt-1">
                  Based on {stats.totalRatings || 0} review{(stats.totalRatings || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const distribution = stats.ratingDistribution || {};
                const count = distribution[star as keyof typeof distribution] || 0;
                const totalRatings = stats.totalRatings || 0;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {displayedRatings.map((rating) => (
          <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {rating.rater.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{rating.rater.name}</p>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={rating.score} size="sm" />
                    <span className="text-xs text-gray-500">
                      {formatDate(rating.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {rating.comments && (
              <p className="text-gray-700 text-sm ml-11 leading-relaxed">
                {rating.comments}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreReviews && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews 
              ? 'Show Less Reviews' 
              : `Show All ${ratings.length} Reviews`
            }
          </Button>
        </div>
      )}
    </Card>
  );
};