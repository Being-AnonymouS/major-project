import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../useAuth';
import { mockUser } from '../../../tests/utils/test-utils';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService');

const mockAuthService = authService as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should provide initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should handle successful login', async () => {
    const mockLoginResponse = {
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    mockAuthService.login.mockResolvedValue({
      success: true,
      data: mockLoginResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-access-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
  });

  it('should handle login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.user).toBeNull();
  });

  it('should handle successful registration', async () => {
    const mockRegisterResponse = {
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    mockAuthService.register.mockResolvedValue({
      success: true,
      data: mockRegisterResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'MENTEE',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'mock-access-token');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
  });

  it('should handle registration failure', async () => {
    mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'MENTEE',
        });
      })
    ).rejects.toThrow('Email already exists');

    expect(result.current.user).toBeNull();
  });

  it('should handle logout', () => {
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  it('should restore user from token on mount', async () => {
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    mockAuthService.getCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle token restoration failure', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token');
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuthContext must be used within an AuthProvider');
  });
});