import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { isJwtExpired } from '../utils/jwt';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const isUnauthorizedError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const typedError = error as {
    status?: number;
    code?: string;
    response?: { status?: number; data?: { error?: { code?: string } } };
  };

  const status = typedError.status ?? typedError.response?.status;
  const code = typedError.code ?? typedError.response?.data?.error?.code;

  return status === 401 || code === 'UNAUTHORIZED' || code === 'INVALID_TOKEN';
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API failures and clear local auth state anyway.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser || isJwtExpired(token)) {
        clearStoredAuth();
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (isMounted) {
          setUser(parsedUser);
        }
      } catch {
        clearStoredAuth();
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const freshUserData = await authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(freshUserData));
        if (isMounted) {
          setUser(freshUserData);
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          clearStoredAuth();
          if (isMounted) {
            setUser(null);
          }
        } else if (import.meta.env.DEV) {
          console.warn('Unable to refresh user profile during initialization.', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token || isJwtExpired(token, 300)) {
        void logout();
      }
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, logout]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);
    localStorage.setItem('token', response.token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
