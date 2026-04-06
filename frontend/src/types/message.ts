import { User } from './auth';

export interface Message {
  id: string;
  appointmentId: string;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  from: User;
  to: User;
}

export interface Conversation {
  appointmentId: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  appointment: {
    id: string;
    datetime: string;
    status: string;
  };
}

export interface SendMessageRequest {
  appointmentId: string;
  text: string;
}

export interface MessageNotification {
  type: 'new_message';
  message: Message;
}