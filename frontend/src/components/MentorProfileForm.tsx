import React, { useState } from 'react';
import { User, TimeSlot } from '../types/auth';
import { useFormValidation } from '../hooks/useFormValidation';
import { profileValidationRules, EXPERTISE_AREAS } from '../utils/profileValidation';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { MultiSelect } from './ui/MultiSelect';
import { AvailabilitySlots } from './AvailabilitySlots';

interface MentorProfileFormProps {
  user: User;
  onSubmit: (data: any) => Promise<void>; // Change to any to allow transformation
  isLoading?: boolean;
}

interface MentorProfileData {
  name: string;
  expertise: string; // Keep as string for internal form state
  bio: string;
  yearsExperience: number;
  availabilitySlots: TimeSlot[];
}

export const MentorProfileForm: React.FC<MentorProfileFormProps> = ({
  user,
  onSubmit,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState<string>('');

  const initialValues: MentorProfileData = {
    name: user.name || '',
    expertise: Array.isArray(user.expertise) ? user.expertise.join(', ') : (user.expertise || ''),
    bio: user.bio || '',
    yearsExperience: user.yearsExperience || 0,
    availabilitySlots: user.availabilitySlots || [],
  };

  const validationRules = [
    { field: 'name' as keyof MentorProfileData, validate: profileValidationRules.name },
    { field: 'expertise' as keyof MentorProfileData, validate: profileValidationRules.expertise },
    { field: 'bio' as keyof MentorProfileData, validate: profileValidationRules.bio },
    { field: 'yearsExperience' as keyof MentorProfileData, validate: profileValidationRules.yearsExperience },
    { field: 'availabilitySlots' as keyof MentorProfileData, validate: profileValidationRules.availabilitySlots },
  ];

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
  } = useFormValidation({
    initialValues,
    validationRules,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    try {
      // Transform expertise from string to array for backend
      const submitData = {
        ...values,
        expertise: values.expertise ? values.expertise.split(',').map(s => s.trim()).filter(s => s) : []
      };
      await onSubmit(submitData);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update profile');
    }
  };

  const expertiseOptions = EXPERTISE_AREAS.map(area => ({
    value: area,
    label: area,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="md:col-span-2">
          <MultiSelect
            label="Areas of Expertise"
            options={expertiseOptions}
            value={values.expertise ? 
              (Array.isArray(values.expertise) ? values.expertise : values.expertise.split(',').map(s => s.trim()).filter(s => s)) 
              : []}
            onChange={(expertise) => setFieldValue('expertise', expertise.join(', '))}
            placeholder="Select your areas of expertise..."
            error={errors.expertise}
            helperText="Select up to 5 areas where you can provide mentorship"
            maxSelections={5}
          />
        </div>

        <div className="md:col-span-1">
          <Input
            label="Years of Experience"
            name="yearsExperience"
            type="number"
            min="0"
            max="50"
            value={values.yearsExperience.toString()}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setFieldValue('yearsExperience', value);
            }}
            onBlur={handleBlur}
            error={errors.yearsExperience}
            placeholder="0"
            required
          />
        </div>

        <div className="md:col-span-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              className={`
                block w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-800 shadow-sm placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                ${errors.bio 
                  ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-300'
                }
              `}
              value={values.bio}
              onChange={(e) => setFieldValue('bio', e.target.value)}
              onBlur={(e) => handleBlur(e as any)}
              placeholder="Tell mentees about your background, experience, and what you can help them with..."
              required
            />
            <div className="flex justify-between mt-1">
              {errors.bio ? (
                <p className="text-sm font-medium text-red-600">{errors.bio}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Minimum 50 characters. Be specific about your expertise and mentoring style.
                </p>
              )}
              <p className="text-sm text-slate-400">
                {values.bio.length}/500
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <AvailabilitySlots
            slots={values.availabilitySlots}
            onChange={(slots) => setFieldValue('availabilitySlots', slots)}
            error={errors.availabilitySlots}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};