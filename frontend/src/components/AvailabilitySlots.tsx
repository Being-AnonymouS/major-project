import React, { useState } from 'react';
import { TimeSlot } from '../types/auth';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { DAYS_OF_WEEK, validateTimeSlot } from '../utils/profileValidation';

interface AvailabilitySlotsProps {
  slots?: TimeSlot[]; // Make optional with default empty array
  onChange: (slots: TimeSlot[]) => void;
  error?: string;
}

export const AvailabilitySlots: React.FC<AvailabilitySlotsProps> = ({
  slots = [], // Provide default empty array
  onChange,
  error,
}) => {
  // Ensure slots is always an array
  const safeSlots = Array.isArray(slots) ? slots : [];
  
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    day: '',
    startTime: '',
    endTime: '',
  });
  const [newSlotError, setNewSlotError] = useState<string>('');

  const handleAddSlot = () => {
    const validationError = validateTimeSlot(newSlot);
    if (validationError) {
      setNewSlotError(validationError);
      return;
    }

    // Check for duplicate slots
    const isDuplicate = safeSlots.some(
      slot => 
        slot.day === newSlot.day && 
        slot.startTime === newSlot.startTime && 
        slot.endTime === newSlot.endTime
    );

    if (isDuplicate) {
      setNewSlotError('This time slot already exists');
      return;
    }

    // Check for overlapping slots on the same day
    const overlapping = safeSlots.some(slot => {
      if (slot.day !== newSlot.day) return false;
      
      const existingStart = new Date(`2000-01-01 ${slot.startTime}`);
      const existingEnd = new Date(`2000-01-01 ${slot.endTime}`);
      const newStart = new Date(`2000-01-01 ${newSlot.startTime}`);
      const newEnd = new Date(`2000-01-01 ${newSlot.endTime}`);
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (overlapping) {
      setNewSlotError('This time slot overlaps with an existing slot');
      return;
    }

    onChange([...safeSlots, newSlot as TimeSlot]);
    setNewSlot({ day: '', startTime: '', endTime: '' });
    setNewSlotError('');
  };

  const handleRemoveSlot = (index: number) => {
    const updatedSlots = safeSlots.filter((_, i) => i !== index);
    onChange(updatedSlots);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const dayOptions = DAYS_OF_WEEK.map(day => ({ value: day, label: day }));

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Availability Slots
        </label>
        
        {/* Add new slot form */}
        <Card className="mb-4 border-slate-200/80 bg-slate-50/70">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <Select
              label="Day"
              options={dayOptions}
              placeholder="Select day"
              value={newSlot.day}
              onChange={(e) => {
                setNewSlot({ ...newSlot, day: e.target.value });
                setNewSlotError('');
              }}
            />
            <Input
              label="Start Time"
              type="time"
              value={newSlot.startTime}
              onChange={(e) => {
                setNewSlot({ ...newSlot, startTime: e.target.value });
                setNewSlotError('');
              }}
            />
            <Input
              label="End Time"
              type="time"
              value={newSlot.endTime}
              onChange={(e) => {
                setNewSlot({ ...newSlot, endTime: e.target.value });
                setNewSlotError('');
              }}
            />
            <Button
              type="button"
              onClick={handleAddSlot}
              disabled={!newSlot.day || !newSlot.startTime || !newSlot.endTime}
            >
              Add Slot
            </Button>
          </div>
          {newSlotError && (
            <p className="mt-2 text-sm font-medium text-red-600">{newSlotError}</p>
          )}
        </Card>

        {/* Display existing slots */}
        {safeSlots.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Current Availability:</h4>
            {safeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
              >
                <span className="text-sm">
                  <span className="font-semibold text-slate-900">{slot.day}</span>
                  {' '}
                  <span className="text-slate-600">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveSlot(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        {slots.length === 0 && (
          <p className="text-sm italic text-slate-500">
            No availability slots added yet. Add at least one slot to complete your profile.
          </p>
        )}

        {error && (
          <p className="mt-1 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};