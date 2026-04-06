import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageThread } from '../MessageThread';
import { Message } from '../../types/message';
import { AuthProvider } from '../../contexts/AuthContext';

const mockMessages: Message[] = [
  {
    id: '1',
    appointmentId: '1',
    fromId: '1',
    toId: '2',
    text: 'Hello, I need help with my project',
    timestamp: '2024-01-15T10:00:00Z',
    from: {
      id: '1',
      name: 'Jane Mentee',
      email: 'jane@example.com',
      role: 'MENTEE'
    },
    to: {
      id: '2',
      name: 'John Mentor',
      email: 'john@example.com',
      role: 'MENTOR'
    }
  },
  {
    id: '2',
    appointmentId: '1',
    fromId: '2',
    toId: '1',
    text: 'Sure! What specific area do you need help with?',
    timestamp: '2024-01-15T10:05:00Z',
    from: {
      id: '2',
      name: 'John Mentor',
      email: 'john@example.com',
      role: 'MENTOR'
    },
    to: {
      id: '1',
      name: 'Jane Mentee',
      email: 'jane@example.com',
      role: 'MENTEE'
    }
  }
];

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Jane Mentee',
      email: 'jane@example.com',
      role: 'MENTEE'
    }
  })
}));

describe('MessageThread', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(component);
  };

  it('renders messages correctly', () => {
    renderWithAuth(
      <MessageThread
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUserName="John Mentor"
      />
    );

    expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument();
    expect(screen.getByText('Sure! What specific area do you need help with?')).toBeInTheDocument();
    expect(screen.getByText('John Mentor')).toBeInTheDocument();
  });

  it('sends message when form is submitted', async () => {
    renderWithAuth(
      <MessageThread
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUserName="John Mentor"
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('sends message when Enter is pressed', async () => {
    renderWithAuth(
      <MessageThread
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUserName="John Mentor"
      />
    );

    const textarea = screen.getByPlaceholderText('Type your message...');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('does not send empty messages', () => {
    renderWithAuth(
      <MessageThread
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        otherUserName="John Mentor"
      />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    renderWithAuth(
      <MessageThread
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
        otherUserName="John Mentor"
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    renderWithAuth(
      <MessageThread
        messages={[]}
        onSendMessage={mockOnSendMessage}
        otherUserName="John Mentor"
      />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start the conversation!')).toBeInTheDocument();
  });
});