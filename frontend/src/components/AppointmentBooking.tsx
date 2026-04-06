import React, { useState } from 'react';
import { User, TimeSlot } from '../types/auth';
import { AppointmentService } from '../services/appointmentService';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AppointmentBookingProps {
  mentor: User;
  onBookingSuccess?: () => void;
  onCancel?: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  mentor,
  onBookingSuccess,
  onCancel,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDate) {
      showError('Please select a date and time slot');
      return;
    }

    setIsLoading(true);
    try {
      // Construct datetime with simple local time (no timezone conversion)
      const datetime = `${selectedDate}T${selectedSlot.startTime}:00`;
      
      await AppointmentService.createAppointment({
        mentorId: mentor.id,
        datetime: datetime, // Send datetime string directly
      });
      
      showSuccess('Appointment request sent successfully!');
      onBookingSuccess?.();
    } catch (error: any) {
      showError(error.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Use local date formatting to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      dates.push({
        value: dateValue,
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    }
    
    return dates;
  };

  const availableDates = getNextWeekDates();
  const availableSlots = mentor.availabilitySlots || [];

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const selectedDateObj = availableDates.find(d => d.value === selectedDate);
    if (!selectedDateObj) return [];
    
    return availableSlots.filter(slot => slot.day === selectedDateObj.dayName);
  };

  return (
    <Card className="p-0 border-0 shadow-none bg-transparent">
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Book with {mentor.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Choose a date and time that fits both schedules.</p>
        </div>
      
      {/* Date Selection */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select Date
        </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {availableDates.map((date) => (
            <button
              key={date.value}
              onClick={() => {
                setSelectedDate(date.value);
                setSelectedSlot(null); // Reset slot selection when date changes
              }}
              className={`p-3 text-sm border rounded-lg transition-colors ${
                selectedDate === date.value
                    ? 'border-brand-600 bg-brand-600 text-white shadow-crisp'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/40'
              }`}
            >
              {date.label}
            </button>
          ))}
          </div>
        </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Select Time Slot
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {getSlotsForSelectedDate().map((slot) => (
              <button
                key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 text-sm border rounded-lg transition-colors ${
                  selectedSlot === slot
                      ? 'border-brand-600 bg-brand-600 text-white shadow-crisp'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/40'
                }`}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
          
          {getSlotsForSelectedDate().length === 0 && (
            <p className="mt-2 text-sm text-slate-500">
              No available slots for this date
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
          <Button
            onClick={handleBookAppointment}
            disabled={!selectedSlot || !selectedDate || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Book Appointment
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};