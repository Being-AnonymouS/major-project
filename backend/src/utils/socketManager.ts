import { Server, Socket } from 'socket.io';
import { verifyToken } from './jwt';
import prisma from './prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketManager {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token);
        
        // Verify user exists
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, role: true, name: true },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join user to their personal room for notifications
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Handle joining appointment rooms for messaging
      socket.on('join-appointment', async (appointmentId: string) => {
        try {
          if (!socket.userId) return;

          // Verify user has access to this appointment
          const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: {
              id: true,
              mentorId: true,
              menteeId: true,
              status: true,
            },
          });

          if (!appointment) {
            socket.emit('error', { message: 'Appointment not found' });
            return;
          }

          if (appointment.mentorId !== socket.userId && appointment.menteeId !== socket.userId) {
            socket.emit('error', { message: 'Access denied to this appointment' });
            return;
          }

          if (appointment.status !== 'ACCEPTED') {
            socket.emit('error', { message: 'Can only join accepted appointments' });
            return;
          }

          socket.join(`appointment:${appointmentId}`);
          socket.emit('joined-appointment', { appointmentId });
          
          console.log(`User ${socket.userId} joined appointment room: ${appointmentId}`);
        } catch (error) {
          console.error('Error joining appointment:', error);
          socket.emit('error', { message: 'Failed to join appointment' });
        }
      });

      // Handle leaving appointment rooms
      socket.on('leave-appointment', (appointmentId: string) => {
        socket.leave(`appointment:${appointmentId}`);
        socket.emit('left-appointment', { appointmentId });
        console.log(`User ${socket.userId} left appointment room: ${appointmentId}`);
      });

      // Handle real-time message sending
      socket.on('send-message', async (data: {
        appointmentId: string;
        text: string;
      }) => {
        try {
          if (!socket.userId) return;

          const { appointmentId, text } = data;

          // Verify appointment access
          const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: {
              id: true,
              mentorId: true,
              menteeId: true,
              status: true,
            },
          });

          if (!appointment) {
            socket.emit('error', { message: 'Appointment not found' });
            return;
          }

          if (appointment.mentorId !== socket.userId && appointment.menteeId !== socket.userId) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          if (appointment.status !== 'ACCEPTED') {
            socket.emit('error', { message: 'Can only message in accepted appointments' });
            return;
          }

          // Create message in database
          const toId = appointment.mentorId === socket.userId 
            ? appointment.menteeId 
            : appointment.mentorId;

          const message = await prisma.message.create({
            data: {
              appointmentId,
              fromId: socket.userId,
              toId,
              text: text.trim(),
            },
            include: {
              from: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              to: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          });

          // Emit to appointment room
          this.io.to(`appointment:${appointmentId}`).emit('new-message', message);
          
          // Also emit to recipient's personal room for notifications
          this.io.to(`user:${toId}`).emit('message-notification', {
            appointmentId,
            message,
          });

          console.log(`Message sent in appointment ${appointmentId} from ${socket.userId} to ${toId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing-start', (appointmentId: string) => {
        socket.to(`appointment:${appointmentId}`).emit('user-typing', {
          userId: socket.userId,
          appointmentId,
        });
      });

      socket.on('typing-stop', (appointmentId: string) => {
        socket.to(`appointment:${appointmentId}`).emit('user-stopped-typing', {
          userId: socket.userId,
          appointmentId,
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }

  // Method to send notification to a specific user
  public sendNotificationToUser(userId: string, notification: any): void {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Method to send message to appointment room
  public sendMessageToAppointment(appointmentId: string, message: any): void {
    this.io.to(`appointment:${appointmentId}`).emit('new-message', message);
  }

  // Method to get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Method to check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

// Export will be done from server.ts after initialization