import { Request, Response } from 'express';
import { registerUser, loginUser, getUserById, refreshUserToken } from '../services/authService';
import { UserRole } from '../types/database';
import { extractRefreshToken } from '../utils/jwt';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const result = await registerUser({
      email,
      password,
      name,
      role: role as UserRole,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    res.status(400).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'REGISTRATION_FAILED',
      },
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    res.status(401).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'LOGIN_FAILED',
      },
    });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN',
        },
      });
      return;
    }

    const result = await refreshUserToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
    
    res.status(401).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'TOKEN_REFRESH_FAILED',
      },
    });
  }
};

/**
 * Get current user info
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User info retrieved successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user info';
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'GET_USER_FAILED',
      },
    });
  }
};

/**
 * Logout user with token invalidation
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Token invalidation is handled by the logoutWithTokenInvalidation middleware
  res.status(200).json({
    success: true,
    data: null,
    message: 'Logout successful. Tokens have been invalidated.',
  });
};