import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types/message';
import { useAuth } from '../hooks/useAuth';
import { formatMessageTimestamp, groupMessagesByDate } from '../utils/messageUtils';

interface MessageThreadProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
  otherUserName?: string;
  appointmentStatus?: string;
  onBack?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages = [], // Provide default empty array
  onSendMessage,
  isLoading = false,
  isSending = false,
  otherUserName = 'User',
  appointmentStatus,
  onBack,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isSending) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
              aria-label="Back to conversations"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-lg font-semibold text-slate-900">{otherUserName}</h2>
        </div>
        
        {/* Status Banner for Completed Appointments */}
        {appointmentStatus === 'COMPLETED' && (
          <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5">
            <p className="flex items-center text-sm font-medium text-emerald-700">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Session completed - Chat history is available for review
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {Object.entries(groupedMessages).map(([dateGroup, groupMessages]) => (
          <div key={dateGroup}>
            {/* Date separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {dateGroup}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {groupMessages.map((message) => {
                const isOwnMessage = message.fromId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 shadow-sm lg:max-w-md ${
                      isOwnMessage
                        ? 'bg-brand-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-brand-100' : 'text-slate-500'
                      }`}>
                        {formatMessageTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-slate-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {appointmentStatus === 'COMPLETED' ? (
        <div className="border-t border-slate-200 bg-slate-50/80 p-4">
          <div className="py-3 text-center text-slate-500">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Session completed - New messages cannot be sent
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
                rows={1}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="flex h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-brand-600 p-3 text-white transition-colors hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};