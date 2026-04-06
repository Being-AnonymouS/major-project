import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from './useAuth';
import { ReadStatusManager } from '../utils/readStatusManager';
import { Conversation, Message } from '../types/message';

interface LoadConversationsOptions {
  background?: boolean;
}

const areConversationListsEqual = (current: Conversation[], next: Conversation[]): boolean => {
  if (current.length !== next.length) {
    return false;
  }

  for (let index = 0; index < current.length; index += 1) {
    const currentItem = current[index];
    const nextItem = next[index];

    if (
      currentItem.appointmentId !== nextItem.appointmentId ||
      currentItem.unreadCount !== nextItem.unreadCount ||
      currentItem.appointment.status !== nextItem.appointment.status ||
      currentItem.lastMessage?.id !== nextItem.lastMessage?.id ||
      currentItem.lastMessage?.timestamp !== nextItem.lastMessage?.timestamp
    ) {
      return false;
    }
  }

  return true;
};

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onNewMessage, offNewMessage, isConnected } = useSocket();
  const { error: showError } = useToast();
  const { user } = useAuth();

  // Load conversations
  const loadConversations = useCallback(async (options?: LoadConversationsOptions) => {
    const background = options?.background ?? false;

    try {
      if (!background) {
        setIsLoading(true);
        setError(null);
      }
      
      // Check if user is authenticated before making API call
      const token = localStorage.getItem('token');

      if (!token) {
        setConversations((previousConversations) => previousConversations.length > 0 ? [] : previousConversations);
        return;
      }

      const data = await messageService.getConversations();
      setConversations((previousConversations) =>
        areConversationListsEqual(previousConversations, data) ? previousConversations : data
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load conversations';
      if (import.meta.env.DEV) {
        console.warn('Unable to load conversations:', err);
      }
      if (!background) {
        setError(errorMessage);
      }
      
      // Only show error toast if it's not an authentication error
      if (!background && !errorMessage.includes('Authentication') && !errorMessage.includes('401')) {
        showError(errorMessage);
      }
    } finally {
      if (!background) {
        setIsLoading(false);
      }
    }
  }, [showError]);

  // Get total unread count from backend data
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Handle new message updates
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setConversations(prev => prev.map(conv => {
        if (conv.appointmentId === message.appointmentId) {
          const shouldIncrement = message.fromId !== user?.id;
          
          return {
            ...conv,
            lastMessage: message,
            unreadCount: shouldIncrement ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      }));
    };

    onNewMessage(handleNewMessage);
    
    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [offNewMessage, onNewMessage, user?.id]);

  // Serverless fallback: keep conversations fresh when WebSocket is unavailable.
  useEffect(() => {
    if (!user || isConnected) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadConversations({ background: true });
    }, 25000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isConnected, loadConversations, user]);

  // Mark conversation as read and update read status
  const markAsRead = useCallback(async (appointmentId: string) => {
    try {
      await messageService.markAsRead(appointmentId);
      
      // Mark as read in local storage
      ReadStatusManager.markAsRead(appointmentId);
      
      // Update conversations to reset unread count
      setConversations(prev => prev.map(conv => 
        conv.appointmentId === appointmentId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn('Unable to mark conversation as read:', err);
      }
    }
  }, []);

  // Force refresh conversations (useful for updating counts)
  const refreshConversations = useCallback(() => {
    loadConversations({ background: false });
  }, [loadConversations]);

  return {
    conversations,
    totalUnreadCount,
    isLoading,
    error,
    loadConversations,
    markAsRead,
    refreshConversations
  };
};