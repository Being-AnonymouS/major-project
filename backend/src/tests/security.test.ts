/**
 * Security implementation tests
 * These tests verify that the security enhancements are working correctly
 */

import { sanitizeString, sanitizeObject } from '../middleware/inputSanitization';
import { generateTokenPair, verifyAccessToken, verifyRefreshToken, isTokenNearExpiry } from '../utils/jwt';
import { isSuspiciousRequest } from '../utils/securityMonitor';
import { validateSecurityConfig } from '../config/security';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'MENTEE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  expertise: null,
  bio: null,
  yearsExperience: null,
  availabilitySlots: null,
  ratingAverage: null,
  institute: 'Test Institute',
  course: 'Test Course',
  goals: 'Test Goals',
};

describe('Security Implementation Tests', () => {
  describe('Input Sanitization', () => {
    test('should sanitize XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeString(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Hello World');
    });

    test('should sanitize SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = sanitizeString(maliciousInput);
      
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    test('should sanitize objects recursively', () => {
      const maliciousObject = {
        name: '<script>alert("xss")</script>John',
        email: 'test@example.com',
        nested: {
          value: 'javascript:alert("xss")',
        },
      };
      
      const sanitized = sanitizeObject(maliciousObject);
      
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.nested.value).not.toContain('javascript:');
    });

    test('should handle null and undefined values', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
      expect(sanitizeObject(null)).toBe(null);
      expect(sanitizeObject(undefined)).toBe(undefined);
    });
  });

  describe('JWT Token Security', () => {
    test('should generate valid token pair', () => {
      const tokens = generateTokenPair(mockUser);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    test('should verify access token correctly', () => {
      const tokens = generateTokenPair(mockUser);
      const decoded = verifyAccessToken(tokens.accessToken);
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('should verify refresh token correctly', () => {
      const tokens = generateTokenPair(mockUser);
      const decoded = verifyRefreshToken(tokens.refreshToken);
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('should detect tokens near expiry', () => {
      // This test would need a token that's about to expire
      // For now, we'll just test that the function doesn't throw
      const tokens = generateTokenPair(mockUser);
      const nearExpiry = isTokenNearExpiry(tokens.accessToken);
      
      expect(typeof nearExpiry).toBe('boolean');
    });

    test('should reject invalid tokens', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('Suspicious Request Detection', () => {
    test('should detect XSS attempts in URL', () => {
      const mockRequest = {
        originalUrl: '/api/users?search=<script>alert("xss")</script>',
        url: '/api/users?search=<script>alert("xss")</script>',
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      } as any;
      
      const result = isSuspiciousRequest(mockRequest);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    test('should detect SQL injection attempts', () => {
      const mockRequest = {
        originalUrl: '/api/users?id=1 UNION SELECT * FROM users',
        url: '/api/users?id=1 UNION SELECT * FROM users',
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      } as any;
      
      const result = isSuspiciousRequest(mockRequest);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    test('should detect suspicious user agents', () => {
      const mockRequest = {
        originalUrl: '/api/users',
        url: '/api/users',
        headers: {
          'user-agent': 'sqlmap/1.0',
        },
      } as any;
      
      const result = isSuspiciousRequest(mockRequest);
      
      expect(result.suspicious).toBe(true);
      expect(result.reasons.some(r => r.includes('User-Agent'))).toBe(true);
    });

    test('should allow normal requests', () => {
      const mockRequest = {
        originalUrl: '/api/users?search=john',
        url: '/api/users?search=john',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      } as any;
      
      const result = isSuspiciousRequest(mockRequest);
      
      expect(result.suspicious).toBe(false);
      expect(result.reasons.length).toBe(0);
    });
  });

  describe('Security Configuration', () => {
    test('should validate security configuration', () => {
      const validation = validateSecurityConfig();
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });
});

// Export for potential use in other test files
export {
  mockUser,
};