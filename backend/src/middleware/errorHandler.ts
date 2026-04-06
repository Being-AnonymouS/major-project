import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field?.[0] || 'field';
      return new ConflictError(`${fieldName} already exists`, { field: fieldName });
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Invalid reference to related record');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('Required relation is missing');
    
    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR', { code: error.code });
  }
};

// Handle different types of errors
const handleError = (error: Error): AppError => {
  // If it's already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  // Handle validation errors from other libraries
  if (error.name === 'ValidationError') {
    return new ValidationError(error.message);
  }

  // Default to internal server error
  return new AppError(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    500,
    'INTERNAL_ERROR'
  );
};

// Global error handling middleware
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const appError = handleError(error);

  // Log error details
  console.error('Error occurred:', {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    stack: appError.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Send error response
  res.status(appError.statusCode).json({
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      ...(appError.details && { details: appError.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: appError.stack }),
    },
  });
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

export default globalErrorHandler;