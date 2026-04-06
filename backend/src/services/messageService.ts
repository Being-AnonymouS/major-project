import prisma from '../utils/prisma';
import { MessageWithUsers } from '../types/database';

export class MessageService {
  /**
   * Create a new message
   */
  async createMessage(
    appointmentId: string,
    fromId: string,
    toId: string,
    text: string
  ): Promise<MessageWithUsers> {
    try {
      // Verify appointment exists and users are part of it
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
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'ACCEPTED') {
        throw new Error('Messages can only be sent for accepted appointments');
      }

      // Verify fromId is part of the appointment
      if (appointment.mentorId !== fromId && appointment.menteeId !== fromId) {
        throw new Error('User is not part of this appointment');
      }

      // Determine toId based on fromId
      const actualToId = appointment.mentorId === fromId ? appointment.menteeId : appointment.mentorId;
      
      if (toId !== actualToId) {
        throw new Error('Invalid recipient for this appointment');
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          appointmentId,
          fromId,
          toId: actualToId,
          text: text.trim(),
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              expertise: true,
              bio: true,
              yearsExperience: true,
              availabilitySlots: true,
              ratingAverage: true,
              institute: true,
              course: true,
              goals: true,
            },
          },
          to: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              expertise: true,
              bio: true,
              yearsExperience: true,
              availabilitySlots: true,
              ratingAverage: true,
              institute: true,
              course: true,
              goals: true,
            },
          },
        },
      });

      return message as MessageWithUsers;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific appointment
   */
  async getAppointmentMessages(
    appointmentId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: MessageWithUsers[]; total: number; hasMore: boolean }> {
    try {
      // Verify user has access to this appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          mentorId: true,
          menteeId: true,
          status: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.mentorId !== userId && appointment.menteeId !== userId) {
        throw new Error('Access denied to this appointment');
      }

      const skip = (page - 1) * limit;

      // Get total count
      const total = await prisma.message.count({
        where: { appointmentId },
      });

      // Get messages with pagination
      const messages = await prisma.message.findMany({
        where: { appointmentId },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              expertise: true,
              bio: true,
              yearsExperience: true,
              availabilitySlots: true,
              ratingAverage: true,
              institute: true,
              course: true,
              goals: true,
            },
          },
          to: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              expertise: true,
              bio: true,
              yearsExperience: true,
              availabilitySlots: true,
              ratingAverage: true,
              institute: true,
              course: true,
              goals: true,
            },
          },
        },
        orderBy: { timestamp: 'asc' },
        skip,
        take: limit,
      });

      const hasMore = skip + messages.length < total;

      return {
        messages: messages as MessageWithUsers[],
        total,
        hasMore,
      };
    } catch (error) {
      console.error('Error getting appointment messages:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string, userRole?: string): Promise<{
    conversations: Array<{
      appointmentId: string;
      appointment: {
        id: string;
        datetime: Date;
        status: string;
        mentor: {
          id: string;
          name: string;
          email: string;
        };
        mentee: {
          id: string;
          name: string;
          email: string;
        };
      };
      lastMessage: MessageWithUsers | null;
      unreadCount: number;
    }>;
  }> {
    try {
      // Get appointments based on user role
      const appointmentQuery = userRole === 'ADMIN' 
        ? {
            // Admins can see all conversations
            status: {
              in: ['ACCEPTED', 'COMPLETED']
            },
          }
        : {
            // Regular users see only their conversations
            OR: [
              { mentorId: userId },
              { menteeId: userId },
            ],
            status: {
              in: ['ACCEPTED', 'COMPLETED']
            },
          };

      console.log('DEBUG: Getting conversations for user:', userId, 'role:', userRole);
      
      const appointments = await prisma.appointment.findMany({
        where: appointmentQuery,
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mentee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            include: {
              from: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  createdAt: true,
                  updatedAt: true,
                  expertise: true,
                  bio: true,
                  yearsExperience: true,
                  availabilitySlots: true,
                  ratingAverage: true,
                  institute: true,
                  course: true,
                  goals: true,
                },
              },
              to: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  createdAt: true,
                  updatedAt: true,
                  expertise: true,
                  bio: true,
                  yearsExperience: true,
                  availabilitySlots: true,
                  ratingAverage: true,
                  institute: true,
                  course: true,
                  goals: true,
                },
              },
            },
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        orderBy: { datetime: 'desc' },
      });

      const conversations = appointments.map((appointment) => {
        const lastMessage = appointment.messages[0] || null;
        
        // Return 0 for unread count - frontend will handle this with ReadStatusManager
        // In a production app, you'd track read status in the database
        const unreadCount = 0;

        return {
          appointmentId: appointment.id,
          appointment: {
            id: appointment.id,
            datetime: appointment.datetime,
            status: appointment.status,
            mentor: appointment.mentor,
            mentee: appointment.mentee,
          },
          lastMessage: lastMessage as MessageWithUsers | null,
          unreadCount,
        };
      });

      return { conversations };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read for an appointment
   */
  async markMessagesAsRead(appointmentId: string, userId: string): Promise<void> {
    try {
      // Verify user has access to this appointment
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          OR: [
            { mentorId: userId },
            { menteeId: userId },
          ],
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found or access denied');
      }

      // For now, we'll just return success since we don't have a read status field
      // In a real app, you'd update a read status or read timestamp
      // This could be implemented as a separate table for message read status
      console.log(`Messages marked as read for appointment ${appointmentId} by user ${userId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message (only by sender)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: {
          fromId: true,
          appointmentId: true,
        },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.fromId !== userId) {
        throw new Error('You can only delete your own messages');
      }

      await prisma.message.delete({
        where: { id: messageId },
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();