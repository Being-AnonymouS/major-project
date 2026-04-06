import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { emitMessageToAppointment, emitNotificationToUser } from '../services/socketService';

export class MessageController {
  /**
   * Send a new message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId, text } = req.body;
      const fromId = req.user!.userId;

      if (!req.appointment) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Appointment information not found',
            code: 'APPOINTMENT_INFO_MISSING',
          },
        });
        return;
      }

      // Only allow sending new messages for accepted appointments
      if (req.appointment.status !== 'ACCEPTED') {
        res.status(403).json({
          success: false,
          error: {
            message: 'New messages can only be sent for accepted appointments',
            code: 'APPOINTMENT_NOT_ACTIVE',
          },
        });
        return;
      }

      // Determine recipient based on sender
      const toId = req.appointment.mentorId === fromId 
        ? req.appointment.menteeId 
        : req.appointment.mentorId;

      const message = await messageService.createMessage(
        appointmentId,
        fromId,
        toId,
        text
      );

      // Emit real-time message to appointment room
      emitMessageToAppointment(appointmentId, message);
      
      // Also emit to recipient's personal room for notifications
      emitNotificationToUser(toId, {
        type: 'new_message',
        appointmentId,
        message,
      });

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      const statusCode = errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('Access denied') || errorMessage.includes('not part of') ? 403 :
                        errorMessage.includes('only be sent for accepted') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: statusCode === 404 ? 'NOT_FOUND' :
                statusCode === 403 ? 'ACCESS_DENIED' :
                statusCode === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get messages for a specific appointment
   */
  async getAppointmentMessages(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getAppointmentMessages(
        appointmentId,
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        data: {
          messages: result.messages,
          pagination: {
            page,
            limit,
            total: result.total,
            hasMore: result.hasMore,
          },
        },
      });
    } catch (error) {
      console.error('Error getting appointment messages:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to get messages';
      const statusCode = errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('Access denied') ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: statusCode === 404 ? 'NOT_FOUND' :
                statusCode === 403 ? 'ACCESS_DENIED' : 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      console.log('DEBUG: Getting conversations for user:', userId, 'role:', userRole);

      const result = await messageService.getUserConversations(userId, userRole);
      console.log('DEBUG: Conversations result:', result.conversations.length, 'conversations');

      res.json({
        success: true,
        data: result.conversations,
      });
    } catch (error) {
      console.error('Error getting user conversations:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get conversations',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Mark messages as read for an appointment
   */
  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = req.user!.userId;

      await messageService.markMessagesAsRead(appointmentId, userId);

      res.json({
        success: true,
        data: null, // Add data property for consistency with API client
        message: 'Messages marked as read',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark messages as read';
      const statusCode = errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('access') ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: statusCode === 404 ? 'NOT_FOUND' :
                statusCode === 403 ? 'ACCESS_DENIED' : 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      await messageService.deleteMessage(messageId, userId);

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      const statusCode = errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('only delete your own') ? 403 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          message: errorMessage,
          code: statusCode === 404 ? 'NOT_FOUND' :
                statusCode === 403 ? 'ACCESS_DENIED' : 'INTERNAL_ERROR',
        },
      });
    }
  }
}

export const messageController = new MessageController();