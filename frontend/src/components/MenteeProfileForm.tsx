import React, { useState } from 'react';
import { User } from '../types/auth';
import { useFormValidation } from '../hooks/useFormValidation';
import { profileValidationRules } from '../utils/profileValidation';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface MenteeProfileFormProps {
  user: User;
  onSubmit: (data: MenteeProfileData) => Promise<void>;
  isLoading?: boolean;
}

interface MenteeProfileData {
  name: string;
  institute: string;
  course: string;
  goals: string;
}

export const MenteeProfileForm: React.FC<MenteeProfileFormProps> = ({
  user,
  onSubmit,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState<string>('');

  const initialValues: MenteeProfileData = {
    name: user.name || '',
    institute: user.institute || '',
    course: user.course || '',
    goals: user.goals || '',
  };

  const validationRules = [
    { field: 'name' as keyof MenteeProfileData, validate: profileValidationRules.name },
    { field: 'institute' as keyof MenteeProfileData, validate: profileValidationRules.institute },
    { field: 'course' as keyof MenteeProfileData, validate: profileValidationRules.course },
    { field: 'goals' as keyof MenteeProfileData, validate: profileValidationRules.goals },
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
      await onSubmit(values);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update profile');
    }
  };

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

        <div className="md:col-span-1">
          <Input
            label="Institute/Organization"
            name="institute"
            value={values.institute}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.institute}
            placeholder="e.g., University of Technology"
            required
          />
        </div>

        <div className="md:col-span-1">
          <Input
            label="Course/Field of Study"
            name="course"
            value={values.course}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.course}
            placeholder="e.g., Computer Science, MBA"
            required
          />
        </div>

        <div className="md:col-span-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Goals & Objectives
            </label>
            <textarea
              name="goals"
              rows={4}
              className={`
                block w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-800 shadow-sm placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                ${errors.goals 
                  ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-300'
                }
              `}
              value={values.goals}
              onChange={(e) => setFieldValue('goals', e.target.value)}
              onBlur={(e) => handleBlur(e as any)}
              placeholder="Describe what you want to learn, achieve, or improve through mentorship..."
              required
            />
            <div className="flex justify-between mt-1">
              {errors.goals ? (
                <p className="text-sm font-medium text-red-600">{errors.goals}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Be specific about your goals to help mentors understand how they can best help you.
                </p>
              )}
              <p className="text-sm text-slate-400">
                {values.goals.length}/300
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-brand-900">
              Tips for a great profile
            </h3>
            <div className="mt-2 text-sm text-brand-800">
              <ul className="list-disc list-inside space-y-1">
                <li>Be specific about your current level and what you want to achieve</li>
                <li>Mention any particular challenges you're facing</li>
                <li>Include your timeline or urgency for achieving your goals</li>
                <li>Describe what type of mentorship style works best for you</li>
              </ul>
            </div>
          </div>
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