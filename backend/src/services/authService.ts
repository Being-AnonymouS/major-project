import prisma from '../utils/prisma';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { UserRole, UserWithoutPassword } from '../types/database';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: UserWithoutPassword;
}

/**
 * Register a new user
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const { email, password, name, role } = data;

  // Validate input
  if (!email || !password || !name || !role) {
    throw new Error('All fields are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Validate role
  if (!['MENTOR', 'MENTEE', 'ADMIN'].includes(role)) {
    throw new Error('Invalid role specified');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      expertise: true,
      bio: true,
      yearsExperience: true,
      availabilitySlots: true,
      ratingAverage: true,
      institute: true,
      course: true,
      goals: true,
    },
  });

  // Type assertion for role since Prisma returns string but we know it's UserRole
  const userWithTypedRole = { ...user, role: user.role as UserRole };

  // Generate JWT token pair
  const tokens = generateTokenPair(userWithTypedRole);

  return { 
    user: userWithTypedRole, 
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Remove password from user object and type the role
  const { password: _, ...userWithoutPassword } = user;
  const userWithTypedRole = { ...userWithoutPassword, role: userWithoutPassword.role as UserRole };

  // Generate JWT token pair
  const tokens = generateTokenPair(userWithTypedRole);

  return { 
    user: userWithTypedRole, 
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

/**
 * Refresh user token
 */
export const refreshUserToken = async (refreshToken: string): Promise<RefreshResponse> => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        expertise: true,
        bio: true,
        yearsExperience: true,
        availabilitySlots: true,
        ratingAverage: true,
        institute: true,
        course: true,
        goals: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Type assertion for role
    const userWithTypedRole = { ...user, role: user.role as UserRole };

    // Generate new token pair
    const tokens = generateTokenPair(userWithTypedRole);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithTypedRole,
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserWithoutPassword | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      expertise: true,
      bio: true,
      yearsExperience: true,
      availabilitySlots: true,
      ratingAverage: true,
      institute: true,
      course: true,
      goals: true,
    },
  });

  if (!user) return null;

  // Type assertion for role since Prisma returns string but we know it's UserRole
  return { ...user, role: user.role as UserRole };
};