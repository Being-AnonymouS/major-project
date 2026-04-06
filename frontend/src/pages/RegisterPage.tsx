import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../contexts/ToastContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { ApiException } from '../types/api';
import { validationRules } from '../utils/validation';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'MENTOR' | 'MENTEE' | '';
}

const roleOptions = [
  { value: 'MENTEE', label: 'Mentee - I want to find mentors' },
  { value: 'MENTOR', label: 'Mentor - I want to help others' },
];

export const RegisterPage: React.FC = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const {
    values: form,
    errors,
    handleChange,
    validateForm,
    setFieldError,
  } = useFormValidation<RegisterForm>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    validationRules: [
      {
        field: 'name',
        validate: validationRules.name,
      },
      {
        field: 'email',
        validate: (value) => {
          if (!value || !value.trim()) return 'Email is required';
          return validationRules.email(value);
        },
      },
      {
        field: 'password',
        validate: validationRules.password,
      },
      {
        field: 'confirmPassword',
        validate: (value, formData) => validationRules.confirmPassword(formData.password)(value),
      },
      {
        field: 'role',
        validate: validationRules.role,
      },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as 'MENTOR' | 'MENTEE',
      });
      success('Account created!', 'Welcome to Mentor Connect. Your account has been created successfully.');
      navigate('/app', { replace: true });
    } catch (error) {
      if (error instanceof ApiException) {
        switch (error.code) {
          case 'EMAIL_ALREADY_EXISTS':
            setFieldError('email', 'An account with this email already exists');
            break;
          case 'VALIDATION_ERROR':
            if (error.details?.field) {
              setFieldError(error.details.field, error.message);
            } else {
              setGeneralError('Please check your input and try again');
            }
            break;
          case 'NETWORK_ERROR':
            setGeneralError('Network error. Please check your connection and try again');
            break;
          default:
            setGeneralError(error.message || 'Registration failed. Please try again');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-mesh">
      <PublicNavbar />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-crisp">
                <BrandMark className="h-6 w-6" />
            </div>
            <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Join mentors and mentees building meaningful growth together.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Or{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <Card className="p-6 sm:p-7">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {generalError}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Your full name"
                autoComplete="name"
                required
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />

              <Select
                label="I want to..."
                name="role"
                value={form.role}
                onChange={handleChange}
                error={errors.role}
                options={roleOptions}
                placeholder="Select your role"
                required
              />

              <PasswordInput
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a password"
                autoComplete="new-password"
                helperText="At least 6 characters with uppercase, lowercase, and a number"
                required
              />

              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};