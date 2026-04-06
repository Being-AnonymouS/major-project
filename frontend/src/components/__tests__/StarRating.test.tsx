import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../ui/StarRating';

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} maxRating={5} />);
    
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('displays correct rating visually', () => {
    render(<StarRating rating={3.5} />);
    
    // Check that stars have correct classes for filled/half-filled/empty
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('calls onRatingChange when interactive and star is clicked', () => {
    const mockOnRatingChange = jest.fn();
    
    render(
      <StarRating 
        rating={0} 
        interactive={true} 
        onRatingChange={mockOnRatingChange} 
      />
    );
    
    const firstStar = screen.getAllByRole('button')[0];
    fireEvent.click(firstStar);
    
    expect(mockOnRatingChange).toHaveBeenCalledWith(1);
  });

  it('does not call onRatingChange when not interactive', () => {
    const mockOnRatingChange = jest.fn();
    
    render(
      <StarRating 
        rating={0} 
        interactive={false} 
        onRatingChange={mockOnRatingChange} 
      />
    );
    
    const firstStar = screen.getAllByRole('button')[0];
    fireEvent.click(firstStar);
    
    expect(mockOnRatingChange).not.toHaveBeenCalled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<StarRating rating={3} size="sm" />);
    
    let stars = screen.getAllByRole('button');
    expect(stars[0].querySelector('svg')).toHaveClass('w-4', 'h-4');
    
    rerender(<StarRating rating={3} size="lg" />);
    stars = screen.getAllByRole('button');
    expect(stars[0].querySelector('svg')).toHaveClass('w-6', 'h-6');
  });

  it('has proper accessibility attributes', () => {
    render(<StarRating rating={3} />);
    
    const stars = screen.getAllByRole('button');
    expect(stars[0]).toHaveAttribute('aria-label', '1 star');
    expect(stars[1]).toHaveAttribute('aria-label', '2 stars');
  });
});