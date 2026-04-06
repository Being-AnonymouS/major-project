import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { UserRole } from '../types/database';
import prisma from '../utils/prisma';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('DEBUG AUTH: Authenticating request for', req.method, req.url);
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      console.log('DEBUG AUTH: User not found for ID:', decoded.userId);
      res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    // Add user info to request
    console.log('DEBUG AUTH: User authenticated successfully:', user);
    req.user = decoded;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    
    res.status(401).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'INVALID_TOKEN',
      },
    });
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is a mentor
 */
export const requireMentor = authorizeRoles('MENTOR');

/**
 * Middleware to check if user is a mentee
 */
export const requireMentee = authorizeRoles('MENTEE');

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = authorizeRoles('ADMIN');

/**
 * Middleware to check if user is mentor or mentee (not admin)
 */
export const requireMentorOrMentee = authorizeRoles('MENTOR', 'MENTEE');