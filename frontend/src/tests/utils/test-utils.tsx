import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { SocketProvider } from '../../contexts/SocketContext';

// Mock user for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'MENTEE' as const,
  institute: 'Test University',
  course: 'Computer Science',
  goals: 'Learn web development',
};

export const mockMentor = {
  id: '2',
  email: 'mentor@example.com',
  name: 'Test Mentor',
  role: 'MENTOR' as const,
  expertise: 'JavaScript,React',
  bio: 'Experienced developer',
  yearsExperience: 5,
  ratingAverage: 4.5,
  availabilitySlots: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
  ],
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper functions for common test scenarios
export const createMockAppointment = (overrides = {}) => ({
  id: '1',
  mentorId: '2',
  menteeId: '1',
  datetime: new Date('2024-01-15T10:00:00Z'),
  status: 'ACCEPTED' as const,
  mentor: mockMentor,
  mentee: mockUser,
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: '1',
  appointmentId: '1',
  fromId: '1',
  toId: '2',
  text: 'Hello, looking forward to our session!',
  timestamp: new Date('2024-01-14T15:30:00Z'),
  ...overrides,
});

export const createMockRating = (overrides = {}) => ({
  id: '1',
  appointmentId: '1',
  score: 5,
  comments: 'Great session!',
  rater: mockUser,
  ...overrides,
});

// Mock localStorage
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
});

// Helper to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));