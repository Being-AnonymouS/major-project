import React, { useState } from 'react';
import { CreateRatingRequest } from '../types/rating';
import { StarRating } from './ui/StarRating';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface RatingFormProps {
  appointmentId: string;
  mentorName: string;
  onSubmit: (rating: CreateRatingRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  appointmentId,
  mentorName,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [score, setScore] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [errors, setErrors] = useState<{ score?: string; comments?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { score?: string; comments?: string } = {};

    if (score < 1 || score > 5) {
      newErrors.score = 'Please select a rating between 1 and 5 stars';
    }

    if (comments.length > 500) {
      newErrors.comments = 'Comments must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const ratingRequest: CreateRatingRequest = {
      appointmentId,
      score,
      comments: comments.trim() || undefined,
    };

    try {
      await onSubmit(ratingRequest);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleRatingChange = (newRating: number) => {
    setScore(newRating);
    if (errors.score) {
      setErrors({ ...errors, score: undefined });
    }
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComments(value);
    
    if (errors.comments && value.length <= 500) {
      setErrors({ ...errors, comments: undefined });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Rate Your Session with {mentorName}
        </h3>
        <p className="text-sm text-gray-600">
          Your feedback helps other mentees and improves the platform experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate this mentoring session?
          </label>
          <div className="flex items-center space-x-4">
            <StarRating
              rating={score}
              interactive={true}
              onRatingChange={handleRatingChange}
              size="lg"
            />
            {score > 0 && (
              <span className="text-sm text-gray-600">
                {score} star{score !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {errors.score && (
            <p className="mt-2 text-sm text-red-600">{errors.score}</p>
          )}
        </div>

        {/* Comments */}
        <div>
          <label 
            htmlFor="comments" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Share your experience with this mentor..."
            value={comments}
            onChange={handleCommentsChange}
            maxLength={500}
          />
          <div className="mt-1 flex justify-between items-center">
            <div>
              {errors.comments && (
                <p className="text-sm text-red-600">{errors.comments}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {comments.length}/500 characters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || score === 0}
            isLoading={isLoading}
          >
            Submit Rating
          </Button>
        </div>
      </form>
    </Card>
  );
};