import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import prisma from '../../utils/prisma';
import { createTestApp } from '../utils/testApp';

describe('Auth Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = createTestApp();
    // Clean up database before tests
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            email: 'test@example.com',
            name: 'Test User',
            role: 'MENTEE',
          },
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('Test User');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      };

      // Create first user
      await request(app).post('/api/auth/register').send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'User with this email already exists',
          code: 'REGISTRATION_FAILED',
        },
      });
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'REGISTRATION_FAILED',
        },
      });
    });

    it('should return error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
        role: 'MENTEE',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Password validation failed');
    });

    it('should return error for missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        // missing password, name, role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'All fields are required',
          code: 'REGISTRATION_FAILED',
        },
      });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
        role: 'MENTEE',
      });
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            email: 'test@example.com',
            name: 'Test User',
            role: 'MENTEE',
          },
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'LOGIN_FAILED',
        },
      });
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'ValidPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'LOGIN_FAILED',
        },
      });
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: 'Test User',
          role: 'MENTEE',
        });

      accessToken = registerResponse.body.data.accessToken;
    });

    it('should get current user successfully', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'MENTEE',
        },
      });
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Access token required',
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register to get refresh token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: 'Test User',
          role: 'MENTEE',
        });

      refreshToken = registerResponse.body.data.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: {
            email: 'test@example.com',
            name: 'Test User',
            role: 'MENTEE',
          },
        },
      });
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          message: 'Invalid refresh token',
          code: 'TOKEN_REFRESH_FAILED',
        },
      });
    });
  });
});