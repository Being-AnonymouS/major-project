import { User, TimeSlot } from '../types/auth';
import { validationRules, combineValidators } from './validation';

// Expertise areas available for mentors
export const EXPERTISE_AREAS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'UI/UX Design',
  'Backend Development',
  'Frontend Development',
  'Database Design',
  'Cloud Computing',
  'Cybersecurity',
  'Software Architecture',
  'Project Management',
  'Career Guidance',
  'Interview Preparation',
];

// Days of the week for availability slots
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Profile validation rules
export const profileValidationRules = {
  // Common validations
  name: combineValidators(
    validationRules.required('Name'),
    validationRules.minLength(2, 'Name')
  ),

  // Mentor-specific validations
  expertise: (value: string) => {
    if (!value || value.trim() === '') {
      return 'Please select at least one area of expertise';
    }
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    if (skills.length === 0) {
      return 'Please select at least one area of expertise';
    }
    if (skills.length > 5) {
      return 'Please select no more than 5 areas of expertise';
    }
    return undefined;
  },

  bio: (value: string) => {
    if (!value || !value.trim()) {
      return 'Bio is required';
    }
    if (value.trim().length < 50) {
      return 'Bio must be at least 50 characters';
    }
    if (value.trim().length > 500) {
      return 'Bio must be no more than 500 characters';
    }
    return undefined;
  },

  yearsExperience: (value: number) => {
    if (value === undefined || value === null) {
      return 'Years of experience is required';
    }
    if (value < 0) {
      return 'Years of experience cannot be negative';
    }
    if (value > 50) {
      return 'Years of experience seems too high';
    }
    return undefined;
  },

  availabilitySlots: (value: TimeSlot[]) => {
    if (!value || value.length === 0) {
      return 'Please add at least one availability slot';
    }
    
    // Validate each slot
    for (const slot of value) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return 'All availability slots must have day, start time, and end time';
      }
      
      // Check if start time is before end time
      const start = new Date(`2000-01-01 ${slot.startTime}`);
      const end = new Date(`2000-01-01 ${slot.endTime}`);
      
      if (start >= end) {
        return 'Start time must be before end time for all slots';
      }
    }
    
    return undefined;
  },

  // Mentee-specific validations
  institute: (value: string) => {
    if (!value || !value.trim()) {
      return 'Institute/Organization is required';
    }
    if (value.trim().length < 2) {
      return 'Institute name must be at least 2 characters';
    }
    return undefined;
  },

  course: (value: string) => {
    if (!value || !value.trim()) {
      return 'Course/Field is required';
    }
    if (value.trim().length < 2) {
      return 'Course/Field must be at least 2 characters';
    }
    return undefined;
  },

  goals: (value: string) => {
    if (!value || !value.trim()) {
      return 'Goals are required';
    }
    if (value.trim().length < 20) {
      return 'Goals must be at least 20 characters';
    }
    if (value.trim().length > 300) {
      return 'Goals must be no more than 300 characters';
    }
    return undefined;
  },
};

// Check profile completion status
export const getProfileCompletionStatus = (user: User) => {
  const requiredFields = user.role === 'MENTOR' 
    ? ['name', 'expertise', 'bio', 'yearsExperience', 'availabilitySlots']
    : ['name', 'institute', 'course', 'goals'];

  const completedFields = requiredFields.filter(field => {
    const value = user[field as keyof User];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });

  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
  const isComplete = completionPercentage === 100;

  return {
    completionPercentage,
    isComplete,
    completedFields: completedFields.length,
    totalFields: requiredFields.length,
    missingFields: requiredFields.filter(field => !completedFields.includes(field)),
  };
};

// Validate time slot format
export const validateTimeSlot = (slot: Partial<TimeSlot>): string | undefined => {
  if (!slot.day) return 'Day is required';
  if (!slot.startTime) return 'Start time is required';
  if (!slot.endTime) return 'End time is required';
  
  if (!DAYS_OF_WEEK.includes(slot.day)) {
    return 'Invalid day selected';
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(slot.startTime)) {
    return 'Invalid start time format';
  }
  if (!timeRegex.test(slot.endTime)) {
    return 'Invalid end time format';
  }
  
  // Check if start time is before end time
  const start = new Date(`2000-01-01 ${slot.startTime}`);
  const end = new Date(`2000-01-01 ${slot.endTime}`);
  
  if (start >= end) {
    return 'Start time must be before end time';
  }
  
  return undefined;
};