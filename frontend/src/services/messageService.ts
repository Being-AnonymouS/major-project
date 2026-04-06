import { apiClient } from './apiClient';
import { Message, Conversation, SendMessageRequest } from '../types/message';
import { User } from '../types/auth';

// Backend conversation response type (different from frontend Conversation type)
interface BackendConversation {
  appointmentId: string;
  appointment: {
    id: string;
    datetime: string;
    status: string;
    mentor: User;
    mentee: User;
  };
  lastMessage: Message | null;
  unreadCount: number;
}

export const messageService = {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<BackendConversation[]>('/messages/conversations/list');
    
    // Get current user from localStorage to determine otherUser
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id;
    
    // Transform backend response to frontend Conversation type
    return response.map(conv => ({
      appointmentId: conv.appointmentId,
      appointment: {
        id: conv.appointment.id,
        datetime: conv.appointment.datetime,
        status: conv.appointment.status,
      },
      otherUser: currentUserId === conv.appointment.mentor.id
        ? conv.appointment.mentee
        : conv.appointment.mentor,
      lastMessage: conv.lastMessage || undefined,
      unreadCount: conv.unreadCount,
    }));
  },

  // Get messages for a specific appointment
  async getMessages(appointmentId: string): Promise<Message[]> {
    const response = await apiClient.get<{
      messages: Message[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
    }>(`/messages/${appointmentId}`);
    return response.messages;
  },

  // Send a new message
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', request);
    return response;
  },

  // Mark messages as read for an appointment
  async markAsRead(appointmentId: string): Promise<void> {
    await apiClient.put(`/messages/${appointmentId}/read`, {});
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messages/message/${messageId}`);
  },
};
