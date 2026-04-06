/**
 * Jest test setup file
 */

import { PrismaClient } from '@prisma/client';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-purposes-only';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'file:./test.db';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.user.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.$disconnect();
});

export { prisma };