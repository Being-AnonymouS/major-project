import { Request } from 'express';

/**
 * Security monitoring and logging utilities
 */

interface SecurityEvent {
  type: 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_REQUEST' | 'AUTH_FAILURE' | 'CORS_VIOLATION' | 'INPUT_SANITIZATION' | 'TOKEN_REFRESH' | 'LOGIN_SUCCESS' | 'LOGOUT';
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  path: string;
  method: string;
  timestamp: Date;
  details?: any;
}

// In-memory store for security events (in production, use a proper logging service)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 1000; // Keep only the last 1000 events

/**
 * Log a security event
 */
export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>): void => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };
  
  // Add to in-memory store
  securityEvents.push(securityEvent);
  
  // Keep only the last MAX_EVENTS
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift();
  }
  
  // Log to console (in production, use proper logging service)
  console.warn(`[SECURITY] ${event.type}: ${event.ip} - ${event.method} ${event.path}`, {
    userAgent: event.userAgent,
    userId: event.userId,
    email: event.email,
    details: event.details,
  });
};

/**
 * Get client IP address
 */
export const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Check for suspicious request patterns
 */
export const isSuspiciousRequest = (req: Request): { suspicious: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  // Check for common attack patterns in URL
  const suspiciousPatterns = [
    /\.\./,                    // Directory traversal
    /<script/i,                // XSS attempts
    /javascript:/i,            // JavaScript injection
    /vbscript:/i,              // VBScript injection
    /onload=/i,                // Event handler injection
    /onerror=/i,               // Event handler injection
    /eval\(/i,                 // Code evaluation
    /union.*select/i,          // SQL injection
    /drop.*table/i,            // SQL injection
    /insert.*into/i,           // SQL injection
    /delete.*from/i,           // SQL injection
    /update.*set/i,            // SQL injection
    /exec\(/i,                 // Command execution
    /system\(/i,               // System command execution
    /\$\{.*\}/,                // Template injection
    /%00/,                     // Null byte injection
    /%2e%2e/i,                 // URL encoded directory traversal
    /%3cscript/i,              // URL encoded XSS
  ];
  
  const fullUrl = req.originalUrl || req.url;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      reasons.push(`Suspicious pattern in URL: ${pattern.source}`);
    }
  }
  
  // Check User-Agent for suspicious patterns
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
  ];
  
  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      reasons.push(`Suspicious User-Agent: ${userAgent}`);
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
  ];
  
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      reasons.push(`Suspicious header present: ${header}`);
    }
  }
  
  // Check request size
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10 * 1024 * 1024) { // 10MB
    reasons.push(`Unusually large request: ${contentLength} bytes`);
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
};

/**
 * Monitor authentication attempts
 */
export const monitorAuthAttempt = (req: Request, success: boolean, email?: string, userId?: string): void => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  
  if (success) {
    logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      ip,
      userAgent,
      userId,
      email,
      path: req.path,
      method: req.method,
      details: { success: true },
    });
  } else {
    logSecurityEvent({
      type: 'AUTH_FAILURE',
      ip,
      userAgent,
      email,
      path: req.path,
      method: req.method,
      details: { success: false },
    });
  }
};

/**
 * Monitor rate limit violations
 */
export const monitorRateLimitViolation = (req: Request, limitType: string): void => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  
  logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    ip,
    userAgent,
    path: req.path,
    method: req.method,
    details: { limitType },
  });
};

/**
 * Monitor CORS violations
 */
export const monitorCorsViolation = (req: Request, origin?: string): void => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  
  logSecurityEvent({
    type: 'CORS_VIOLATION',
    ip,
    userAgent,
    path: req.path,
    method: req.method,
    details: { origin },
  });
};

/**
 * Monitor token refresh events
 */
export const monitorTokenRefresh = (req: Request, userId: string, email: string): void => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'];
  
  logSecurityEvent({
    type: 'TOKEN_REFRESH',
    ip,
    userAgent,
    userId,
    email,
    path: req.path,
    method: req.method,
    details: { tokenRefreshed: true },
  });
};

/**
 * Get security statistics
 */
export const getSecurityStats = (): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  topIPs: Array<{ ip: string; count: number }>;
  recentEvents: SecurityEvent[];
} => {
  const eventsByType: Record<string, number> = {};
  const ipCounts: Record<string, number> = {};
  
  securityEvents.forEach(event => {
    // Count by type
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    
    // Count by IP
    ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
  });
  
  // Get top IPs
  const topIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Get recent events (last 50)
  const recentEvents = securityEvents.slice(-50);
  
  return {
    totalEvents: securityEvents.length,
    eventsByType,
    topIPs,
    recentEvents,
  };
};

/**
 * Check if IP should be blocked (simple implementation)
 */
export const shouldBlockIP = (ip: string): boolean => {
  const recentEvents = securityEvents
    .filter(event => event.ip === ip)
    .filter(event => Date.now() - event.timestamp.getTime() < 60 * 60 * 1000); // Last hour
  
  // Block if more than 20 security events in the last hour
  return recentEvents.length > 20;
};

/**
 * Middleware to check for suspicious requests
 */
export const suspiciousRequestMiddleware = (req: any, _res: any, next: any): void => {
  const suspiciousCheck = isSuspiciousRequest(req);
  
  if (suspiciousCheck.suspicious) {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    logSecurityEvent({
      type: 'SUSPICIOUS_REQUEST',
      ip,
      userAgent,
      path: req.path,
      method: req.method,
      details: { reasons: suspiciousCheck.reasons },
    });
    
    // For now, just log and continue. In production, you might want to block the request
    console.warn(`Suspicious request detected from ${ip}: ${suspiciousCheck.reasons.join(', ')}`);
  }
  
  next();
};

export default {
  logSecurityEvent,
  getClientIP,
  isSuspiciousRequest,
  monitorAuthAttempt,
  monitorRateLimitViolation,
  monitorCorsViolation,
  monitorTokenRefresh,
  getSecurityStats,
  shouldBlockIP,
  suspiciousRequestMiddleware,
};