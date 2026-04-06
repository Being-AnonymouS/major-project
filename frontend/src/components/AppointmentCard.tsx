import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { useAuth } from '../hooks/useAuth';
import { AppointmentService } from '../services/appointmentService';
import { RatingService } from '../services/ratingService';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { StarRating } from './ui/StarRating';
import { RatingModal } from './RatingModal';
import { CreateRatingRequest, Rating } from '../types/rating';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate?: (appointment: Appointment) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdate,
  onViewDetails,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [canRate, setCanRate] = useState(false);

  const isMentor = user?.role === 'MENTOR';
  const isMentee = user?.role === 'MENTEE';
  const otherUser = isMentor ? appointment.mentee : appointment.mentor;
  const canAccept = isMentor && appointment.status === 'REQUESTED';
  const canReject = isMentor && appointment.status === 'REQUESTED';
  const canComplete = appointment.status === 'ACCEPTED';
  const canCancel = appointment.status === 'REQUESTED' || appointment.status === 'ACCEPTED';
  const canChat = appointment.status === 'ACCEPTED' || appointment.status === 'COMPLETED';

  // Check rating eligibility when appointment status changes
  useEffect(() => {
    const checkRatingEligibility = async () => {
      if (appointment.status === 'COMPLETED' && isMentee) {
        try {
          const [ratingResponse, existingRatingResponse] = await Promise.all([
            RatingService.canRateAppointment(appointment.id),
            RatingService.getAppointmentRating(appointment.id),
          ]);
          
          setCanRate(ratingResponse.canRate);
          setExistingRating(existingRatingResponse);
        } catch (error) {
          console.error('Error checking rating eligibility:', error);
        }
      }
    };

    checkRatingEligibility();
  }, [appointment.id, appointment.status, isMentee]);

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'COMPLETED':
        return 'bg-brand-50 text-brand-700 border border-brand-100';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-100';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const handleStatusUpdate = async (action: 'accept' | 'reject' | 'complete' | 'cancel') => {
    setIsLoading(true);
    try {
      let updatedAppointment: Appointment;
      
      switch (action) {
        case 'accept':
          updatedAppointment = await AppointmentService.acceptAppointment(appointment.id);
          showSuccess('Appointment accepted successfully');
          break;
        case 'reject':
          updatedAppointment = await AppointmentService.rejectAppointment(appointment.id);
          showSuccess('Appointment rejected');
          break;
        case 'complete':
          updatedAppointment = await AppointmentService.completeAppointment(appointment.id);
          showSuccess('Appointment marked as completed');
          break;
        case 'cancel':
          updatedAppointment = await AppointmentService.cancelAppointment(appointment.id);
          showSuccess('Appointment cancelled');
          break;
        default:
          return;
      }
      
      onUpdate?.(updatedAppointment);
    } catch (error: any) {
      showError(error.message || `Failed to ${action} appointment`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async (ratingRequest: CreateRatingRequest) => {
    setIsRatingLoading(true);
    try {
      const newRating = await RatingService.submitRating(ratingRequest);
      setExistingRating(newRating);
      setCanRate(false);
      showSuccess('Rating submitted successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to submit rating');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleOpenChat = () => {
    navigate(`/messages?appointmentId=${appointment.id}`);
  };

  const { date, time } = formatDateTime(appointment.datetime);

  return (
    <Card className="p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {isMentor ? 'Session with' : 'Session with'} {otherUser.name}
          </h3>
          <p className="text-sm text-slate-600">
            {isMentor ? 'Mentee' : 'Mentor'}: {otherUser.email}
          </p>
        </div>
        <Badge className={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>

      <div className="mb-4">
        <p className="mb-1 text-sm text-slate-700">
          <span className="font-medium">Date:</span> {date}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Time:</span> {time}
        </p>
      </div>

      {/* Mentor-specific information */}
      {!isMentor && appointment.mentor.expertise && (
        <div className="mb-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium">Expertise:</span> {appointment.mentor.expertise.split(',').join(', ')}
          </p>
        </div>
      )}

      {/* Rating Display for Completed Appointments */}
      {appointment.status === 'COMPLETED' && existingRating && (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-900">
                Your Rating
              </p>
              <div className="flex items-center space-x-2">
                <StarRating rating={existingRating.score} size="sm" />
                <span className="text-sm text-slate-600">
                  {existingRating.score} star{existingRating.score !== 1 ? 's' : ''}
                </span>
              </div>
              {existingRating.comments && (
                <p className="mt-2 text-sm italic text-slate-700">
                  "{existingRating.comments}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {canAccept && (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate('accept')}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Accept
          </Button>
        )}
        
        {canReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate('reject')}
            disabled={isLoading}
          >
            Reject
          </Button>
        )}
        
        {canComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate('complete')}
            disabled={isLoading}
          >
            Mark Complete
          </Button>
        )}
        
        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate('cancel')}
            disabled={isLoading}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}

        {/* Rating Button for Mentees */}
        {canRate && !existingRating && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRatingModalOpen(true)}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Rate Session
          </Button>
        )}
        
        {/* Chat Button for Accepted/Completed Appointments */}
        {canChat && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenChat}
            className="border-brand-300 text-brand-700 hover:bg-brand-50"
          >
            Chat
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails?.(appointment)}
        >
          View Details
        </Button>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        appointmentId={appointment.id}
        mentorName={appointment.mentor.name}
        onSubmit={handleRatingSubmit}
        isLoading={isRatingLoading}
      />
    </Card>
  );
};