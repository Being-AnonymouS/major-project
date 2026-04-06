import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = !isFilled && starRating - 0.5 <= rating;

    return (
      <button
        key={index}
        type="button"
        className={`${getSizeClass()} ${
          interactive 
            ? 'cursor-pointer hover:scale-110 transition-transform' 
            : 'cursor-default'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded`}
        onClick={() => handleStarClick(starRating)}
        disabled={!interactive}
        aria-label={`${starRating} star${starRating !== 1 ? 's' : ''}`}
      >
        <svg
          className={`${getSizeClass()} ${
            isFilled 
              ? 'text-yellow-400 fill-current' 
              : isHalfFilled
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isHalfFilled ? (
            <defs>
              <linearGradient id={`half-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="rgb(209 213 219)" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isHalfFilled ? `url(#half-${index})` : 'currentColor'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </div>
  );
};