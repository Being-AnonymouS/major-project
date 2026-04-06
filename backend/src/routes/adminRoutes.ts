import { Router } from 'express';
import {
  getUsers,
  getAppointments,
  getStats,
  updateUserStatusController,
  getUserById,
  deleteUser,
  cancelAppointment,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { logAdminAction } from '../middleware/adminLogger';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * Get paginated list of users with optional filtering
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - role: MENTOR | MENTEE | ADMIN (optional)
 * - search: string (search by name or email, optional)
 */
router.get(
  '/users',
  logAdminAction('VIEW_USERS', 'USER'),
  getUsers
);

/**
 * GET /api/admin/users/:id
 * Get detailed user information by ID
 */
router.get(
  '/users/:id',
  logAdminAction('VIEW_USER_DETAILS', 'USER'),
  getUserById
);

/**
 * PUT /api/admin/users/:id/status
 * Update user status (suspend/activate)
 * Body: { status: 'ACTIVE' | 'SUSPENDED' }
 */
router.put(
  '/users/:id/status',
  logAdminAction('UPDATE_USER_STATUS', 'USER'),
  updateUserStatusController
);

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
router.delete(
  '/users/:id',
  logAdminAction('DELETE_USER', 'USER'),
  deleteUser
);

/**
 * GET /api/admin/appointments
 * Get paginated list of appointments with optional filtering
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - status: REQUESTED | ACCEPTED | COMPLETED | CANCELLED (optional)
 * - mentorId: string (optional)
 * - menteeId: string (optional)
 * - dateFrom: ISO date string (optional)
 * - dateTo: ISO date string (optional)
 */
router.get(
  '/appointments',
  logAdminAction('VIEW_APPOINTMENTS', 'APPOINTMENT'),
  getAppointments
);

/**
 * PUT /api/admin/appointments/:id/cancel
 * Cancel an appointment (admin override)
 */
router.put(
  '/appointments/:id/cancel',
  logAdminAction('CANCEL_APPOINTMENT', 'APPOINTMENT'),
  cancelAppointment
);

/**
 * GET /api/admin/stats
 * Get platform statistics for admin dashboard
 * Returns:
 * - totalUsers, totalMentors, totalMentees
 * - totalAppointments, completedAppointments, pendingAppointments, cancelledAppointments
 * - averageRating, totalMessages
 * - recentRegistrations (last 30 days)
 */
router.get(
  '/stats',
  logAdminAction('VIEW_STATS', 'SYSTEM'),
  getStats
);

export default router;