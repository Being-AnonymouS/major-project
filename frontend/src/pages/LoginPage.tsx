import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../contexts/ToastContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Card } from '../components/ui/Card';
import { ApiException } from '../types/api';
import { validationRules } from '../utils/validation';

interface LoginForm {
  email: string;
  password: string;
}

interface DemoCredentialGroup {
  role: 'Admin' | 'Mentor' | 'Mentee';
  accounts: Array<{
    email: string;
    password: string;
    label: string;
  }>;
}

const demoCredentialGroups: DemoCredentialGroup[] = [
  {
    role: 'Admin',
    accounts: [
      { email: 'admin@mentorconnect.com', password: 'admin123', label: 'Platform Admin' },
      { email: 'support@mentorconnect.com', password: 'admin123', label: 'Support Team' },
    ],
  },
  {
    role: 'Mentor',
    accounts: [
      { email: 'john.doe@techcorp.com', password: 'mentor123', label: 'Web Development Mentor' },
      { email: 'sarah.wilson@datatech.ai', password: 'mentor123', label: 'Data Science Mentor' },
    ],
  },
  {
    role: 'Mentee',
    accounts: [
      { email: 'alice.johnson@university.edu', password: 'mentee123', label: 'Computer Science Student' },
      { email: 'priya.patel@bootcamp.tech', password: 'mentee123', label: 'Cybersecurity Learner' },
    ],
  },
];

interface DemoCredentialsPanelProps {
  onSelect: (email: string, password: string) => void;
}

const DemoCredentialsPanel: React.FC<DemoCredentialsPanelProps> = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      {demoCredentialGroups.map((group) => (
        <article key={group.role} className="rounded-2xl border border-slate-200 bg-white/85 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{group.role}</h3>
          <div className="mt-3 space-y-2.5">
            {group.accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => onSelect(account.email, account.password)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/60"
              >
                <p className="truncate text-sm font-semibold text-slate-800">{account.label}</p>
                <p className="truncate text-xs text-slate-600">{account.email}</p>
                <p className="text-xs font-medium text-brand-700">Password: {account.password}</p>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileDemo, setShowMobileDemo] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const {
    values: form,
    errors,
    handleChange,
    validateForm,
    setFieldValue,
  } = useFormValidation<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: [
      {
        field: 'email',
        validate: (value) => {
          if (!value || !value.trim()) return 'Email is required';
          return validationRules.email(value);
        },
      },
      {
        field: 'password',
        validate: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 6) return 'Password must be at least 6 characters';
          return undefined;
        },
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
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      success('Welcome back!', 'You have been successfully logged in.');
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof ApiException) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            setGeneralError('Invalid email or password');
            break;
          case 'VALIDATION_ERROR':
            setGeneralError('Please check your input and try again');
            break;
          case 'NETWORK_ERROR':
            setGeneralError('Network error. Please check your connection and try again');
            break;
          default:
            setGeneralError(error.message || 'Login failed. Please try again');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyDemoCredentials = (email: string, password: string) => {
    setFieldValue('email', email);
    setFieldValue('password', password);
    setGeneralError('');
    setShowMobileDemo(false);
  };

  return (
    <div className="min-h-screen bg-hero-mesh">
      <PublicNavbar />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
          <section className="hidden space-y-5 lg:block">
            <div>
              <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                Quick Test Accounts
              </span>
              <h1 className="mt-4 text-balance text-4xl font-bold leading-tight text-slate-900">
                Sign in instantly with demo users or create your own account.
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-600">
                Use these pre-seeded credentials to explore admin, mentor, and mentee experiences without setup.
              </p>
            </div>
            <DemoCredentialsPanel onSelect={applyDemoCredentials} />
          </section>

          <div className="mx-auto w-full max-w-md">
            <Card className="p-6 sm:p-7">
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-600">
                Sign in to continue your mentorship journey.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                New here?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Create a new account
                </Link>
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {generalError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {generalError}
                  </div>
                )}

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

                <PasswordInput
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowMobileDemo((previous) => !previous)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800">Use demo credentials</span>
                    <span className="text-xs font-medium text-brand-700">{showMobileDemo ? 'Hide' : 'Show'}</span>
                  </button>

                  {showMobileDemo && (
                    <div className="mt-3">
                      <DemoCredentialsPanel onSelect={applyDemoCredentials} />
                    </div>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
