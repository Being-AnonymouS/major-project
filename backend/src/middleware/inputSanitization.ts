import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import xss from 'xss';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Enhanced string sanitization with multiple layers of protection
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // First layer: Basic XSS protection
  let sanitized = xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });
  
  // Second layer: DOMPurify for additional protection
  sanitized = purify.sanitize(sanitized, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  // Third layer: Manual cleaning
  sanitized = sanitized
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url() functions
    .replace(/import\s+/gi, '') // Remove import statements
    .replace(/@import/gi, '') // Remove CSS @import
    .replace(/\0/g, '') // Remove null bytes
    // SQL injection prevention
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi, '')
    .replace(/(--|\/\*|\*\/|;)/g, '')
    .replace(/(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi, '')
    .replace(/(\b(OR|AND)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?)/gi, '')
    .replace(/(\bxp_\w+)/gi, '')
    .replace(/(\bsp_\w+)/gi, '');
  
  // Apply additional SQL injection prevention
  sanitized = preventSqlInjection(sanitized);
  
  return sanitized;
};

/**
 * Sanitize HTML content while preserving safe formatting
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return purify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key as well
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware to sanitize all request body data
 */
export const sanitizeRequestBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQueryParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Middleware to sanitize URL parameters
 */
export const sanitizeUrlParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Combined sanitization middleware for all request data
 */
export const sanitizeAllInputs = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Validate and sanitize file uploads (if implemented later)
 */
export const sanitizeFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // This would be used if file upload functionality is added
  // For now, we'll just ensure no files are being uploaded unexpectedly
  if ((req as any).files || (req as any).file) {
    res.status(400).json({
      success: false,
      error: {
        message: 'File uploads are not supported',
        code: 'FILE_UPLOAD_NOT_SUPPORTED',
      },
    });
    return;
  }
  
  next();
};

/**
 * SQL injection prevention (additional layer)
 */
export const preventSqlInjection = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bxp_\w+)/gi,
    /(\bsp_\w+)/gi,
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
};

/**
 * NoSQL injection prevention
 */
export const preventNoSqlInjection = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Remove MongoDB operators
    return obj.replace(/^\$/, '');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(preventNoSqlInjection);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Remove keys that start with $ (MongoDB operators)
        if (!key.startsWith('$')) {
          sanitized[key] = preventNoSqlInjection(obj[key]);
        }
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Comprehensive input validation and sanitization middleware
 */
export const comprehensiveInputSanitization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Sanitize and validate all inputs
    if (req.body && typeof req.body === 'object') {
      req.body = preventNoSqlInjection(sanitizeObject(req.body));
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = preventNoSqlInjection(sanitizeObject(req.query));
    }
    
    if (req.params && typeof req.params === 'object') {
      req.params = preventNoSqlInjection(sanitizeObject(req.params));
    }
    
    // Check for suspicious patterns in headers
    const suspiciousHeaders = ['x-forwarded-for', 'user-agent', 'referer'];
    suspiciousHeaders.forEach(header => {
      if (req.headers[header]) {
        const headerValue = Array.isArray(req.headers[header]) 
          ? req.headers[header]![0] 
          : req.headers[header] as string;
        
        if (headerValue && typeof headerValue === 'string') {
          // Basic validation for suspicious patterns
          if (headerValue.includes('<script') || headerValue.includes('javascript:')) {
            res.status(400).json({
              success: false,
              error: {
                message: 'Suspicious request detected',
                code: 'SUSPICIOUS_REQUEST',
              },
            });
            return;
          }
        }
      }
    });
    
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Input sanitization failed',
        code: 'SANITIZATION_ERROR',
      },
    });
  }
};