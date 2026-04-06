import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { messageService } from '../services/messageService';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useMessaging } from '../hooks/useMessaging';
import { Message } from '../types/message';

export const MessagingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { onNewMessage, offNewMessage, joinAppointmentRoom, leaveAppointmentRoom } = useSocket();
  const { error: showError } = useToast();
  const { user } = useAuth();
  const { conversations, markAsRead, isLoading: isLoadingConversations } = useMessaging();

  // Handle URL parameter for preselecting conversation
  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    if (appointmentId && conversations.length > 0) {
      // Check if the appointment exists in conversations
      const targetConversation = conversations.find(conv => conv.appointmentId === appointmentId);
      if (targetConversation) {
        setSelectedConversationId(appointmentId);
      }
    }
  }, [searchParams, conversations]);

  // Handle real-time message updates
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Only add message if it's not from the current user (avoid duplicates)
      // The sender already sees their message from the HTTP response
      if (message.fromId !== user?.id) {
        // Update messages if it's for the currently selected conversation
        if (message.appointmentId === selectedConversationId) {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg.id === message.id);
            if (messageExists) return prev;
            return [...prev, message];
          });
        }
      }
      
      // Note: The useMessaging hook will handle conversation updates
      // No need to manually update conversations here
    };

    onNewMessage(handleNewMessage);
    
    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [selectedConversationId, onNewMessage, offNewMessage, user?.id]);

  // Join/leave appointment rooms when selection changes
  useEffect(() => {
    if (selectedConversationId) {
      joinAppointmentRoom(selectedConversationId);
      loadMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }

    return () => {
      if (selectedConversationId) {
        leaveAppointmentRoom(selectedConversationId);
      }
    };
  }, [selectedConversationId, joinAppointmentRoom, leaveAppointmentRoom, markAsRead]);

  const loadMessages = async (appointmentId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await messageService.getMessages(appointmentId);
      // Ensure data is always an array
      setMessages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      showError(error.message || 'Failed to load messages');
      // Set empty array on error
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectConversation = (appointmentId: string) => {
    setSelectedConversationId(appointmentId);
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId) return;

    try {
      setIsSendingMessage(true);
      const message = await messageService.sendMessage({
        appointmentId: selectedConversationId,
        text
      });
      
      // Add message to current thread
      setMessages(prev => [...prev, message]);
      
      // Note: Conversation list updates are handled by the useMessaging hook
    } catch (error: any) {
      showError(error.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const selectedConversation = conversations.find(
    conv => conv.appointmentId === selectedConversationId
  );

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoadingConversations}
            />
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <MessageThread
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
              isSending={isSendingMessage}
              otherUserName={selectedConversation.otherUser.name}
              appointmentStatus={selectedConversation.appointment.status}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
