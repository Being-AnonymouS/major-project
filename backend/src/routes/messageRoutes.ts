import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateToken, requireMentorOrMentee } from '../middleware/auth';
import { verifyAppointmentAccess, verifyConversationAccess } from '../middleware/messageAuth';
import { 
  validateMessageCreation, 
  validateMessageQuery,
  validateAppointmentId 
} from '../middleware/validation';
import { messageRateLimit } from '../middleware/rateLimiter';

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

// Allow admin users to access all routes, but require mentor/mentee for others
const requireMentorMenteeOrAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'ADMIN') {
    // Admins can access all messaging features
    next();
  } else {
    // Apply the original mentor/mentee requirement
    requireMentorOrMentee(req, res, next);
  }
};

router.use(requireMentorMenteeOrAdmin);

/**
 * POST /api/messages
 * Send a new message
 */
router.post(
  '/',
  messageRateLimit,
  validateMessageCreation,
  verifyAppointmentAccess,
  messageController.sendMessage
);

/**
 * GET /api/messages/:appointmentId
 * Get messages for a specific appointment
 */
router.get(
  '/:appointmentId',
  (req, _res, next) => {
    // Rename parameter for validation middleware
    req.params.id = req.params.appointmentId;
    next();
  },
  validateAppointmentId,
  validateMessageQuery,
  verifyAppointmentAccess,
  messageController.getAppointmentMessages
);

/**
 * GET /api/messages/conversations
 * Get all conversations for the current user
 * Note: This route must come before /:appointmentId to avoid conflicts
 */
router.get(
  '/conversations/list',
  verifyConversationAccess,
  messageController.getUserConversations
);

/**
 * PUT /api/messages/:appointmentId/read
 * Mark messages as read for an appointment
 */
router.put(
  '/:appointmentId/read',
  (req, _res, next) => {
    // Rename parameter for validation middleware
    req.params.id = req.params.appointmentId;
    next();
  },
  validateAppointmentId,
  verifyAppointmentAccess,
  messageController.markMessagesAsRead
);

/**
 * DELETE /api/messages/:messageId
 * Delete a specific message (only by sender)
 */
router.delete(
  '/message/:messageId',
  messageController.deleteMessage
);

export default router;