import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]'
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-slate-200 border-t-brand-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-slate-500">{loadingText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`relative ${className} ${
        isLoading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={isLoading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
};

export const SkeletonLoader: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center space-x-4">
        <SkeletonLoader className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-3/4" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLoader className="h-3 w-full" />
        <SkeletonLoader className="h-3 w-5/6" />
        <SkeletonLoader className="h-3 w-4/6" />
      </div>
    </div>
  );
};