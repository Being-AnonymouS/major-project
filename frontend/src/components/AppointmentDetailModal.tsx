import React, { useState } from 'react';
import { Appointment } from '../types/appointment';
import { useAuth } from '../hooks/useAuth';
import { AppointmentService } from '../services/appointmentService';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (appointment: Appointment) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!appointment) return null;

  const isMentor = user?.role === 'MENTOR';
  const otherUser = isMentor ? appointment.mentee : appointment.mentor;
  const canAccept = isMentor && appointment.status === 'REQUESTED';
  const canReject = isMentor && appointment.status === 'REQUESTED';
  const canComplete = appointment.status === 'ACCEPTED';
  const canCancel = appointment.status === 'REQUESTED' || appointment.status === 'ACCEPTED';

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      onClose();
    } catch (error: any) {
      showError(error.message || `Failed to ${action} appointment`);
    } finally {
      setIsLoading(false);
    }
  };

  const { date, time } = formatDateTime(appointment.datetime);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Appointment Details">
      <div className="space-y-6">
        {/* Status and Basic Info */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              Session with {otherUser.name}
            </h3>
            <p className="text-gray-600">
              {isMentor ? 'Mentee' : 'Mentor'}: {otherUser.email}
            </p>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>

        {/* Date and Time */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Date:</span> {date}
            </p>
            <p className="text-sm">
              <span className="font-medium">Time:</span> {time}
            </p>
            <p className="text-sm">
              <span className="font-medium">Created:</span>{' '}
              {new Date(appointment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {isMentor ? 'Mentee' : 'Mentor'} Information
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Name:</span> {otherUser.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {otherUser.email}
            </p>
            
            {/* Mentor-specific info */}
            {!isMentor && (
              <>
                {appointment.mentor.expertise && (
                  <p className="text-sm">
                    <span className="font-medium">Expertise:</span>{' '}
                    {appointment.mentor.expertise.split(',').join(', ')}
                  </p>
                )}
                {appointment.mentor.yearsExperience && (
                  <p className="text-sm">
                    <span className="font-medium">Experience:</span>{' '}
                    {appointment.mentor.yearsExperience} years
                  </p>
                )}
                {appointment.mentor.bio && (
                  <p className="text-sm">
                    <span className="font-medium">Bio:</span> {appointment.mentor.bio}
                  </p>
                )}
              </>
            )}
            
            {/* Mentee-specific info */}
            {isMentor && (
              <>
                {appointment.mentee.institute && (
                  <p className="text-sm">
                    <span className="font-medium">Institute:</span> {appointment.mentee.institute}
                  </p>
                )}
                {appointment.mentee.course && (
                  <p className="text-sm">
                    <span className="font-medium">Course:</span> {appointment.mentee.course}
                  </p>
                )}
                {appointment.mentee.goals && (
                  <p className="text-sm">
                    <span className="font-medium">Goals:</span> {appointment.mentee.goals}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {canAccept && (
            <Button
              onClick={() => handleStatusUpdate('accept')}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Accept Appointment
            </Button>
          )}
          
          {canReject && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('reject')}
              disabled={isLoading}
            >
              Reject Appointment
            </Button>
          )}
          
          {canComplete && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('complete')}
              disabled={isLoading}
            >
              Mark as Completed
            </Button>
          )}
          
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('cancel')}
              disabled={isLoading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel Appointment
            </Button>
          )}
          
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};