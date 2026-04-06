import { Request, Response, NextFunction } from 'express';
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  extractTokenFromHeader, 
  extractRefreshToken,
  isTokenNearExpiry,
  validateToken,
  JwtPayload 
} from '../utils/jwt';
import prisma from '../utils/prisma';

// Extend Express Request interface to include user and token refresh info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tokenRefreshed?: boolean;
      newAccessToken?: string;
    }
  }
}

/**
 * Enhanced authentication middleware with automatic token refresh
 */
export const authenticateWithRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = extractTokenFromHeader(req.headers.authorization);

    if (!accessToken) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    try {
      // Try to verify the access token
      const decoded = validateToken(accessToken);
      
      // Verify user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          name: true,
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
        res.status(401).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        });
        return;
      }

      // Check if token is near expiry
      if (isTokenNearExpiry(accessToken)) {
        // Try to refresh the token
        const refreshToken = extractRefreshToken(req);
        
        if (refreshToken) {
          try {
            const refreshDecoded = verifyRefreshToken(refreshToken);
            
            // Ensure refresh token belongs to the same user
            if (refreshDecoded.userId === decoded.userId) {
              const userWithTypedRole = { ...user, role: user.role as any };
              const newAccessToken = generateAccessToken(userWithTypedRole);
              
              // Add new token to response headers
              res.setHeader('X-New-Access-Token', newAccessToken);
              req.newAccessToken = newAccessToken;
              req.tokenRefreshed = true;
              
              console.log(`Token refreshed for user: ${user.email}`);
            }
          } catch (refreshError) {
            // Refresh token is invalid, but access token is still valid
            console.warn(`Failed to refresh token for user: ${user.email}`);
          }
        }
      }

      // Add user info to request
      req.user = decoded;
      next();
    } catch (accessTokenError) {
      // Access token is invalid or expired, try to use refresh token
      const refreshToken = extractRefreshToken(req);
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Access token expired and no refresh token provided',
            code: 'TOKEN_EXPIRED_NO_REFRESH',
          },
        });
        return;
      }

      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        
        // Verify user still exists in database
        const user = await prisma.user.findUnique({
          where: { id: refreshDecoded.userId },
          select: { 
            id: true, 
            email: true, 
            role: true, 
            name: true,
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
          res.status(401).json({
            success: false,
            error: {
              message: 'User not found',
              code: 'USER_NOT_FOUND',
            },
          });
          return;
        }

        // Generate new access token
        const userWithTypedRole = { ...user, role: user.role as any };
        const newAccessToken = generateAccessToken(userWithTypedRole);
        
        // Add new token to response headers
        res.setHeader('X-New-Access-Token', newAccessToken);
        req.newAccessToken = newAccessToken;
        req.tokenRefreshed = true;
        
        // Add user info to request
        req.user = refreshDecoded;
        
        console.log(`Access token refreshed using refresh token for user: ${user.email}`);
        next();
      } catch (refreshError) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Both access and refresh tokens are invalid',
            code: 'INVALID_TOKENS',
          },
        });
        return;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    res.status(401).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'AUTHENTICATION_ERROR',
      },
    });
  }
};

/**
 * Middleware to add token refresh info to response
 */
export const addTokenRefreshInfo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to add token info
  res.json = function(body: any) {
    if (req.tokenRefreshed && req.newAccessToken) {
      // Add token refresh info to response body
      if (typeof body === 'object' && body !== null) {
        body.tokenRefreshed = true;
        body.newAccessToken = req.newAccessToken;
      }
    }
    
    // Call original json method
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Middleware to check token health and warn about expiry
 */
export const checkTokenHealth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = extractTokenFromHeader(req.headers.authorization);
  
  if (accessToken && isTokenNearExpiry(accessToken)) {
    // Add warning header
    res.setHeader('X-Token-Warning', 'Token expires soon, consider refreshing');
  }
  
  next();
};

/**
 * Logout middleware that blacklists tokens
 */
export const logoutWithTokenInvalidation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const accessToken = extractTokenFromHeader(req.headers.authorization);
  const refreshToken = extractRefreshToken(req);
  
  // In a production environment, you would store these in a database or Redis
  // For now, we'll use the in-memory blacklist from jwt.ts
  if (accessToken) {
    const { blacklistToken } = require('../utils/jwt');
    blacklistToken(accessToken);
  }
  
  if (refreshToken) {
    const { blacklistToken } = require('../utils/jwt');
    blacklistToken(refreshToken);
  }
  
  next();
};