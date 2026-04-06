import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { register, login } from '../../controllers/authController';
import * as authService from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');

const mockAuthService = authService as any;

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MENTEE',
      };

      const mockResult = {
        user: mockUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      };

      mockAuthService.registerUser.mockResolvedValue(mockResult);

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      });

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'User registered successfully',
      });
    });

    it('should handle registration error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
        role: 'MENTEE',
      };

      mockAuthService.registerUser.mockRejectedValue(new Error('Password too weak'));

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Password too weak',
          code: 'REGISTRATION_FAILED',
        },
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MENTEE',
      };

      const mockResult = {
        user: mockUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      mockAuthService.loginUser.mockResolvedValue(mockResult);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPassword123!',
      });

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Login successful',
      });
    });

    it('should handle login error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.loginUser.mockRejectedValue(new Error('Invalid email or password'));

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'LOGIN_FAILED',
        },
      });
    });
  });


});