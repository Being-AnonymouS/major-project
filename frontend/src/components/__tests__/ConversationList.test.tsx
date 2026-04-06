import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '../ConversationList';
import { Conversation } from '../../types/message';

const mockConversations: Conversation[] = [
  {
    appointmentId: '1',
    otherUser: {
      id: '2',
      name: 'John Mentor',
      email: 'john@example.com',
      role: 'MENTOR'
    },
    lastMessage: {
      id: '1',
      appointmentId: '1',
      fromId: '2',
      toId: '1',
      text: 'Hello, how can I help you?',
      timestamp: '2024-01-15T10:00:00Z',
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
    },
    unreadCount: 2,
    appointment: {
      id: '1',
      datetime: '2024-01-15T14:00:00Z',
      status: 'ACCEPTED'
    }
  },
  {
    appointmentId: '2',
    otherUser: {
      id: '3',
      name: 'Sarah Mentor',
      email: 'sarah@example.com',
      role: 'MENTOR'
    },
    unreadCount: 0,
    appointment: {
      id: '2',
      datetime: '2024-01-16T15:00:00Z',
      status: 'COMPLETED'
    }
  }
];

describe('ConversationList', () => {
  const mockOnSelectConversation = jest.fn();

  beforeEach(() => {
    mockOnSelectConversation.mockClear();
  });

  it('renders conversations correctly', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('John Mentor')).toBeInTheDocument();
    expect(screen.getByText('Sarah Mentor')).toBeInTheDocument();
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
  });

  it('shows unread count badge when there are unread messages', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onSelectConversation when conversation is clicked', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    fireEvent.click(screen.getByText('John Mentor'));
    expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
  });

  it('shows loading state', () => {
    render(
      <ConversationList
        conversations={[]}
        onSelectConversation={mockOnSelectConversation}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    render(
      <ConversationList
        conversations={[]}
        onSelectConversation={mockOnSelectConversation}
        isLoading={false}
      />
    );

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('highlights selected conversation', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        selectedConversationId="1"
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const selectedConversation = screen.getByText('John Mentor').closest('div');
    expect(selectedConversation).toHaveClass('bg-blue-50');
  });
});