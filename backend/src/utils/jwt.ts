import jwt from 'jsonwebtoken';
import { UserWithoutPassword } from '../types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  tokenType?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (user: UserWithoutPassword): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenType: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // 15 minutes
  } as jwt.SignOptions);
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (user: UserWithoutPassword): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenType: 'refresh',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 days
  } as jwt.SignOptions);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (user: UserWithoutPassword): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

/**
 * Generate a JWT token for a user (backward compatibility)
 */
export const generateToken = (user: UserWithoutPassword): string => {
  return generateAccessToken(user);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if (decoded.tokenType && decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw new Error('Access token verification failed');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    
    if (decoded.tokenType && decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Refresh token verification failed');
  }
};

/**
 * Verify and decode a JWT token (backward compatibility)
 */
export const verifyToken = (token: string): JwtPayload => {
  return verifyAccessToken(token);
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenNearExpiry = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    
    // Return true if token expires within 5 minutes (300 seconds)
    return timeUntilExpiry < 300;
  } catch (error) {
    return true; // Assume expired if we can't decode
  }
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Extract refresh token from cookies or body
 */
export const extractRefreshToken = (req: any): string | null => {
  // Try to get from cookies first
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  
  // Try to get from request body
  if (req.body && req.body.refreshToken) {
    return req.body.refreshToken;
  }
  
  return null;
};

/**
 * Blacklist for invalidated tokens (in production, use Redis or database)
 */
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist
 */
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  
  // Clean up expired tokens periodically
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000); // Remove after 24 hours
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

/**
 * Validate token and check blacklist
 */
export const validateToken = (token: string): JwtPayload => {
  if (isTokenBlacklisted(token)) {
    throw new Error('Token has been invalidated');
  }
  
  return verifyAccessToken(token);
};