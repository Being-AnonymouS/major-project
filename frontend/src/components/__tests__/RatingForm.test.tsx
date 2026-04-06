import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RatingForm } from '../RatingForm';
import { CreateRatingRequest } from '../../types/rating';

// Mock the StarRating component
jest.mock('../ui/StarRating', () => ({
  StarRating: ({ rating, onRatingChange, interactive }: any) => (
    <div data-testid="star-rating">
      {interactive && (
        <button
          onClick={() => onRatingChange?.(5)}
          data-testid="star-button"
        >
          Rate 5 stars
        </button>
      )}
      <span>Rating: {rating}</span>
    </div>
  ),
}));

describe('RatingForm', () => {
  const mockProps = {
    appointmentId: 'test-appointment-id',
    mentorName: 'John Doe',
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rating form with mentor name', () => {
    render(<RatingForm {...mockProps} />);
    
    expect(screen.getByText('Rate Your Session with John Doe')).toBeInTheDocument();
    expect(screen.getByText('How would you rate this mentoring session?')).toBeInTheDocument();
  });

  it('allows user to select rating and submit', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(<RatingForm {...mockProps} onSubmit={mockOnSubmit} />);
    
    // Click on star rating
    fireEvent.click(screen.getByTestId('star-button'));
    
    // Add comments
    const commentsTextarea = screen.getByPlaceholderText('Share your experience with this mentor...');
    fireEvent.change(commentsTextarea, { target: { value: 'Great session!' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Submit Rating'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        appointmentId: 'test-appointment-id',
        score: 5,
        comments: 'Great session!',
      });
    });
  });

  it('shows validation error when no rating is selected', async () => {
    render(<RatingForm {...mockProps} />);
    
    // Try to submit without selecting rating
    fireEvent.click(screen.getByText('Submit Rating'));
    
    await waitFor(() => {
      expect(screen.getByText('Please select a rating between 1 and 5 stars')).toBeInTheDocument();
    });
  });

  it('shows character count for comments', () => {
    render(<RatingForm {...mockProps} />);
    
    const commentsTextarea = screen.getByPlaceholderText('Share your experience with this mentor...');
    fireEvent.change(commentsTextarea, { target: { value: 'Test comment' } });
    
    expect(screen.getByText('12/500 characters')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    
    render(<RatingForm {...mockProps} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    render(<RatingForm {...mockProps} isLoading={true} />);
    
    const submitButton = screen.getByText('Submit Rating');
    expect(submitButton).toBeDisabled();
  });
});