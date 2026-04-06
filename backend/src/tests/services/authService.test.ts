import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { registerUser, loginUser, refreshUserToken, getUserById } from '../../services/authService';
import prisma from '../../utils/prisma';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';

// Mock dependencies
jest.mock('../../utils/prisma', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

const mockPrisma = prisma as any;
const mockPasswordUtils = passwordUtils as any;
const mockJwtUtils = jwtUtils as any;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('registerUser', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'ValidPassword123!',
      name: 'Test User',
      role: 'MENTEE' as const,
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MENTEE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expertise: null,
      bio: null,
      yearsExperience: null,
      availabilitySlots: null,
      ratingAverage: null,
      institute: null,
      course: null,
      goals: null,
    };

    it('should register a new user successfully', async () => {
      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPasswordUtils.validatePassword.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordUtils.hashPassword.mockResolvedValue('hashedPassword');
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockJwtUtils.generateTokenPair.mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await registerUser(validRegisterData);

      expect(result).toEqual({
        user: mockUser,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPasswordUtils.hashPassword).toHaveBeenCalledWith('ValidPassword123!');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(registerUser(validRegisterData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error for invalid email format', async () => {
      const invalidData = { ...validRegisterData, email: 'invalid-email' };

      await expect(registerUser(invalidData)).rejects.toThrow('Invalid email format');
    });

    it('should throw error for weak password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPasswordUtils.validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password too short'],
      });

      const weakPasswordData = { ...validRegisterData, password: '123' };

      await expect(registerUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed: Password too short'
      );
    });

    it('should throw error for invalid role', async () => {
      const invalidRoleData = { ...validRegisterData, role: 'INVALID' as any };

      await expect(registerUser(invalidRoleData)).rejects.toThrow('Invalid role specified');
    });

    it('should throw error for missing required fields', async () => {
      const incompleteData = { ...validRegisterData, name: '' };

      await expect(registerUser(incompleteData)).rejects.toThrow('All fields are required');
    });
  });

  describe('loginUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'ValidPassword123!',
    };

    const mockUserWithPassword = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: 'MENTEE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expertise: null,
      bio: null,
      yearsExperience: null,
      availabilitySlots: null,
      ratingAverage: null,
      institute: null,
      course: null,
      goals: null,
    };

    it('should login user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);
      mockPasswordUtils.comparePassword.mockResolvedValue(true);
      mockJwtUtils.generateTokenPair.mockReturnValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });

      const result = await loginUser(validLoginData);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'MENTEE',
        }),
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser(validLoginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for incorrect password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);
      mockPasswordUtils.comparePassword.mockResolvedValue(false);

      await expect(loginUser(validLoginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for missing credentials', async () => {
      const incompleteData = { email: 'test@example.com', password: '' };

      await expect(loginUser(incompleteData)).rejects.toThrow(
        'Email and password are required'
      );
    });
  });

  describe('refreshUserToken', () => {
    const mockDecodedToken = { userId: '1' };
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MENTEE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expertise: null,
      bio: null,
      yearsExperience: null,
      availabilitySlots: null,
      ratingAverage: null,
      institute: null,
      course: null,
      goals: null,
    };

    it('should refresh token successfully', async () => {
      mockJwtUtils.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockJwtUtils.generateTokenPair.mockReturnValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const result = await refreshUserToken('validRefreshToken');

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        user: mockUser,
      });
    });

    it('should throw error for invalid refresh token', async () => {
      mockJwtUtils.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(refreshUserToken('invalidToken')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user not found', async () => {
      mockJwtUtils.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(refreshUserToken('validRefreshToken')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('getUserById', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MENTEE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expertise: null,
      bio: null,
      yearsExperience: null,
      availabilitySlots: null,
      ratingAverage: null,
      institute: null,
      course: null,
      goals: null,
    };

    it('should return user by ID', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});