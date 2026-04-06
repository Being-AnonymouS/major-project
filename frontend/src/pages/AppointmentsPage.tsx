import React, { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { AppointmentService } from '../services/appointmentService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const statusOptions: { value: AppointmentStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Appointments' },
    { value: 'REQUESTED', label: 'Requested' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AppointmentService.getAppointments();
      setAppointments(data);
    } catch (error: any) {
      showError(error.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const filterAppointments = useCallback(() => {
    if (selectedStatus === 'ALL') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === selectedStatus));
    }
  }, [appointments, selectedStatus]);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedStatus]);

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return filteredAppointments
      .filter(apt => new Date(apt.datetime) > now && apt.status === 'ACCEPTED')
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  };

  const getPendingRequests = () => {
    return filteredAppointments.filter(apt => apt.status === 'REQUESTED');
  };

  const getCompletedAppointments = () => {
    return filteredAppointments.filter(apt => apt.status === 'COMPLETED');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="mt-1 text-slate-600">
            Manage your {user?.role === 'MENTOR' ? 'mentoring' : 'mentee'} sessions
          </p>
        </div>
        <Button onClick={loadAppointments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={selectedStatus === option.value ? 'primary' : 'outline'}
              onClick={() => setSelectedStatus(option.value)}
            >
              {option.label}
              {option.value !== 'ALL' && (
                <span className="ml-1 text-xs">
                  ({appointments.filter(apt => apt.status === option.value).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500">Upcoming Sessions</h3>
          <p className="text-2xl font-bold text-brand-600">{getUpcomingAppointments().length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500">Pending Requests</h3>
          <p className="text-2xl font-bold text-amber-600">{getPendingRequests().length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-500">Completed Sessions</h3>
          <p className="text-2xl font-bold text-emerald-600">{getCompletedAppointments().length}</p>
        </Card>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-500">
            {selectedStatus === 'ALL' 
              ? 'No appointments found' 
              : `No ${selectedStatus.toLowerCase()} appointments`
            }
          </p>
          {user?.role === 'MENTEE' && (
            <Button onClick={() => window.location.href = '/mentors'}>
              Find Mentors
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onUpdate={handleAppointmentUpdate}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdate={handleAppointmentUpdate}
      />
    </div>
  );
};