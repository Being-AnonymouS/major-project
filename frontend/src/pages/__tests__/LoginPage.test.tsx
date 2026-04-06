import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockUseAuth = useAuth as any;
const mockUseNavigate = useNavigate as any;

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false,
    });
    
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email format', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  it('should navigate to register page when register link is clicked', () => {
    render(<LoginPage />);

    const registerLink = screen.getByText(/sign up/i);
    fireEvent.click(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('should redirect authenticated user to dashboard', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: { id: '1', email: 'test@example.com', role: 'MENTEE' },
      isLoading: false,
    });

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should be accessible', () => {
    render(<LoginPage />);

    // Check for proper form structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();

    // Check for proper labeling
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check for proper button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('should toggle password visibility', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});