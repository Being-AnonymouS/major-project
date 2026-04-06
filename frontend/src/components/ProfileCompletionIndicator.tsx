import React from 'react';
import { User } from '../types/auth';
import { getProfileCompletionStatus } from '../utils/profileValidation';

interface ProfileCompletionIndicatorProps {
  user: User;
  className?: string;
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  user,
  className = '',
}) => {
  const status = getProfileCompletionStatus(user);

  const getStatusColor = () => {
    if (status.completionPercentage === 100) return 'text-green-600';
    if (status.completionPercentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = () => {
    if (status.completionPercentage === 100) return 'bg-green-500';
    if (status.completionPercentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (status.completionPercentage === 100) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (status.completionPercentage >= 75) {
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusMessage = () => {
    if (status.isComplete) {
      return 'Profile complete! You\'re ready to connect.';
    }
    
    const missingFieldsText = status.missingFields.map(field => {
      switch (field) {
        case 'expertise': return 'expertise areas';
        case 'yearsExperience': return 'years of experience';
        case 'availabilitySlots': return 'availability slots';
        default: return field;
      }
    }).join(', ');
    
    return `Complete your profile by adding: ${missingFieldsText}`;
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="text-sm font-medium text-gray-900">
            Profile Completion
          </h3>
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {status.completionPercentage}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
          style={{ width: `${status.completionPercentage}%` }}
        />
      </div>
      
      {/* Status message */}
      <p className="text-sm text-gray-600 mb-2">
        {getStatusMessage()}
      </p>
      
      {/* Field completion details */}
      <div className="text-xs text-gray-500">
        {status.completedFields} of {status.totalFields} required fields completed
      </div>
      
      {!status.isComplete && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            💡 Complete your profile to {user.role === 'MENTOR' ? 'start accepting mentee requests' : 'search and book mentors'}
          </p>
        </div>
      )}
    </div>
  );
};