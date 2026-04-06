import React from 'react';
import { CreateRatingRequest } from '../types/rating';
import { RatingForm } from './RatingForm';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  mentorName: string;
  onSubmit: (rating: CreateRatingRequest) => Promise<void>;
  isLoading?: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  mentorName,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (rating: CreateRatingRequest) => {
    await onSubmit(rating);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Rate Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <RatingForm
            appointmentId={appointmentId}
            mentorName={mentorName}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};