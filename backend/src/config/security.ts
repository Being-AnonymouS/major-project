/**
 * Security configuration for the Mentor Connect application
 */

export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  },

  // Rate Limiting Configuration
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60,
    },
    sensitive: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
    },
    messages: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10,
    },
    appointments: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
    },
  },

  // CORS Configuration
  cors: {
    allowedOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-New-Access-Token',
      'X-Token-Warning',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },

  // Input Validation
  validation: {
    maxRequestSize: '1mb',
    maxParameterLimit: 100,
    maxFieldSize: '1mb',
    maxFiles: 0, // No file uploads allowed
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128,
  },

  // Session Configuration
  session: {
    tokenRefreshThreshold: 5 * 60, // 5 minutes before expiry
    maxConcurrentSessions: 5,
    sessionTimeout: 24 * 60 * 60, // 24 hours
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Logging Configuration
  logging: {
    logSecurityEvents: true,
    logFailedAttempts: true,
    logRateLimitViolations: true,
    logSuspiciousActivity: true,
  },

  // Environment-specific settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
};

/**
 * Get security configuration based on environment
 */
export const getSecurityConfig = () => {
  const config = { ...securityConfig };
  
  // Adjust settings based on environment
  if (config.environment.isDevelopment) {
    // More permissive settings for development
    config.rateLimiting.general.max = 200;
    config.rateLimiting.api.max = 120;
  }
  
  if (config.environment.isProduction) {
    // Stricter settings for production
    config.rateLimiting.auth.max = 3;
    config.rateLimiting.sensitive.max = 2;
  }
  
  return config;
};

/**
 * Validate security configuration
 */
export const validateSecurityConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check JWT secrets
  if (securityConfig.jwt.secret === 'your-secret-key-change-in-production') {
    errors.push('JWT secret must be changed from default value');
  }
  
  if (securityConfig.jwt.refreshSecret === 'your-refresh-secret-key-change-in-production') {
    errors.push('JWT refresh secret must be changed from default value');
  }
  
  // Check JWT secret strength
  if (securityConfig.jwt.secret.length < 32) {
    errors.push('JWT secret should be at least 32 characters long');
  }
  
  if (securityConfig.jwt.refreshSecret.length < 32) {
    errors.push('JWT refresh secret should be at least 32 characters long');
  }
  
  // Check environment variables
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is not set');
  }
  
  if (!process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET environment variable is not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default securityConfig;