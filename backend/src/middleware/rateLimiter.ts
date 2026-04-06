import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Enhanced rate limiting with IP tracking and progressive penalties
 */

// Store for tracking repeated violations
const violationStore = new Map<string, { count: number; lastViolation: Date }>();

/**
 * Enhanced rate limit handler with progressive penalties
 */
const createRateLimitHandler = (baseMessage: string, code: string) => {
  return (req: Request, res: Response) => {
    const clientIP = req.ip || 'unknown';
    const now = new Date();
    
    // Track violations
    const violation = violationStore.get(clientIP);
    if (violation) {
      violation.count += 1;
      violation.lastViolation = now;
    } else {
      violationStore.set(clientIP, { count: 1, lastViolation: now });
    }
    
    // Log security event
    console.warn(`Rate limit exceeded: ${clientIP} - ${req.method} ${req.path}`);
    console.warn(`User-Agent: ${req.headers['user-agent']}`);
    console.warn(`Violation count: ${violation?.count || 1}`);
    
    // Progressive penalty based on violation history
    const violationCount = violation?.count || 1;
    let penaltyMultiplier = 1;
    
    if (violationCount > 10) {
      penaltyMultiplier = 4; // 4x penalty for repeat offenders
    } else if (violationCount > 5) {
      penaltyMultiplier = 2; // 2x penalty for frequent violations
    }
    
    res.status(429).json({
      success: false,
      error: {
        message: `${baseMessage}${penaltyMultiplier > 1 ? ` (Enhanced penalty for repeated violations)` : ''}`,
        code,
        retryAfter: Math.floor(15 * 60 * penaltyMultiplier), // Retry after in seconds
      },
    });
  };
};

// Clean up old violations periodically
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [ip, violation] of violationStore.entries()) {
    if (violation.lastViolation < oneHourAgo) {
      violationStore.delete(ip);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes

// General rate limiter with enhanced security
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many requests from this IP, please try again later', 'RATE_LIMITED'),
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many authentication attempts, please try again later', 'AUTH_RATE_LIMITED'),
});

// API rate limiter for general API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('API rate limit exceeded, please slow down', 'API_RATE_LIMITED'),
});

// Strict rate limiter for sensitive operations
export const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour for sensitive operations
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many sensitive operations, please try again later', 'SENSITIVE_RATE_LIMITED'),
});

// Rate limiter for password reset attempts
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many password reset attempts, please try again later', 'PASSWORD_RESET_RATE_LIMITED'),
});

// Rate limiter for registration attempts
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many registration attempts, please try again later', 'REGISTRATION_RATE_LIMITED'),
});

// Rate limiter for message sending
export const messageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many messages sent, please slow down', 'MESSAGE_RATE_LIMITED'),
});

// Rate limiter for appointment booking
export const appointmentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 appointment requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many appointment requests, please try again later', 'APPOINTMENT_RATE_LIMITED'),
});

export default {
  general: generalRateLimit,
  auth: authRateLimit,
  api: apiRateLimit,
  sensitive: sensitiveRateLimit,
};