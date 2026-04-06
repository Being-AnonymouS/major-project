import React from 'react';
import { Conversation } from '../types/message';
import { formatMessageTime } from '../utils/messageUtils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (appointmentId: string) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-4">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-center">No conversations yet</p>
        <p className="text-sm text-center mt-1">Start messaging when you have accepted appointments</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.appointmentId}
          onClick={() => onSelectConversation(conversation.appointmentId)}
          className={`cursor-pointer border-b border-slate-200 p-4 transition-colors hover:bg-slate-50 ${
            selectedConversationId === conversation.appointmentId ? 'bg-brand-50/70' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {conversation.otherUser.name}
                </h3>
                {conversation.lastMessage && (
                  <span className="ml-2 text-xs text-slate-500">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="truncate text-sm text-slate-600">
                  {conversation.lastMessage?.text || 'No messages yet'}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-brand-600 px-2 py-1 text-xs font-bold leading-none text-white shadow-crisp">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  conversation.appointment.status === 'ACCEPTED' 
                    ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                    : conversation.appointment.status === 'COMPLETED'
                    ? 'border border-brand-100 bg-brand-50 text-brand-700'
                    : 'border border-slate-200 bg-slate-100 text-slate-700'
                }`}>
                  {conversation.appointment.status === 'COMPLETED' ? 'Completed' : 
                   conversation.appointment.status === 'ACCEPTED' ? 'Active' :
                   conversation.appointment.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};