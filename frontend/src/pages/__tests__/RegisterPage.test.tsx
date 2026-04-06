import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { RegisterPage } from '../RegisterPage';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  authService: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('I want to...')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      expect(screen.getByText('Please select your role')).toBeInTheDocument();
    });
  });

  it('shows validation error for password mismatch', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows validation error for weak password', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'weakpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeInTheDocument();
    });
  });
});