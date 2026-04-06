import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { Message } from '../types/message';
import { isJwtExpired } from '../utils/jwt';

const DEFAULT_RENDER_BACKEND_URL = 'https://mentor-connect-backend-piyushcoder07-20260406.onrender.com';

const resolveSocketUrl = (): string => {
  const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (configuredSocketUrl) {
    return configuredSocketUrl.replace(/\/+$/, '');
  }

  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredApiUrl && /^https?:\/\//i.test(configuredApiUrl)) {
    return configuredApiUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
  }

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalHost) {
    return window.location.origin;
  }

  return DEFAULT_RENDER_BACKEND_URL;
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onNewMessage: (callback: (message: Message) => void) => void;
  offNewMessage: (callback: (message: Message) => void) => void;
  joinAppointmentRoom: (appointmentId: string) => void;
  leaveAppointmentRoom: (appointmentId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSocket((previousSocket) => {
        if (previousSocket) {
          previousSocket.disconnect();
        }
        return null;
      });
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || isJwtExpired(token)) {
      setIsConnected(false);
      return;
    }

    const socketInstance = io(resolveSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (import.meta.env.DEV) {
        console.info('Socket connected');
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      if (import.meta.env.DEV) {
        console.info('Socket disconnected');
      }
    });

    socketInstance.on('connect_error', (error) => {
      setIsConnected(false);
      if (import.meta.env.DEV) {
        console.warn('Socket connection issue:', error?.message || error);
      }

      const message = (error?.message || '').toLowerCase();
      if (message.includes('auth') || message.includes('token') || message.includes('jwt')) {
        localStorage.removeItem('token');
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    socket?.on('new-message', callback);
  }, [socket]);

  const offNewMessage = useCallback((callback: (message: Message) => void) => {
    socket?.off('new-message', callback);
  }, [socket]);

  const joinAppointmentRoom = useCallback((appointmentId: string) => {
    socket?.emit('join-appointment', appointmentId);
  }, [socket]);

  const leaveAppointmentRoom = useCallback((appointmentId: string) => {
    socket?.emit('leave-appointment', appointmentId);
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onNewMessage,
    offNewMessage,
    joinAppointmentRoom,
    leaveAppointmentRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
