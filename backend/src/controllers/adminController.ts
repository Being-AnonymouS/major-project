import { Request, Response } from 'express';
import {
  getUserList,
  getAppointmentList,
  getPlatformStats,
  updateUserStatus,
  getUserById as getUserByIdService,
  deleteUser as deleteUserService,
  PaginationParams,
  UserFilters,
  AppointmentFilters,
} from '../services/adminService';
import { UserRole, AppointmentStatus } from '../types/database';
import prisma from '../utils/prisma';

/**
 * Get paginated list of users with optional filtering
 * GET /api/admin/users
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 per page
    
    const pagination: PaginationParams = { page, limit };
    
    // Parse filters
    const filters: UserFilters = {};
    
    if (req.query.role && ['MENTOR', 'MENTEE', 'ADMIN'].includes(req.query.role as string)) {
      filters.role = req.query.role as UserRole;
    }
    
    if (req.query.search && typeof req.query.search === 'string') {
      filters.search = req.query.search.trim();
    }
    
    const result = await getUserList(pagination, filters);
    
    // Transform to match frontend PaginatedResponse<T> interface
    res.json({
      success: true,
      data: {
        data: result.users,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve users',
        code: 'GET_USERS_ERROR',
      },
    });
  }
};

/**
 * Get paginated list of appointments with optional filtering
 * GET /api/admin/appointments
 */
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 per page
    
    const pagination: PaginationParams = { page, limit };
    
    // Parse filters
    const filters: AppointmentFilters = {};
    
    if (req.query.status && ['REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].includes(req.query.status as string)) {
      filters.status = req.query.status as AppointmentStatus;
    }
    
    if (req.query.mentorId && typeof req.query.mentorId === 'string') {
      filters.mentorId = req.query.mentorId;
    }
    
    if (req.query.menteeId && typeof req.query.menteeId === 'string') {
      filters.menteeId = req.query.menteeId;
    }
    
    if (req.query.dateFrom && typeof req.query.dateFrom === 'string') {
      const dateFrom = new Date(req.query.dateFrom);
      if (!isNaN(dateFrom.getTime())) {
        filters.dateFrom = dateFrom;
      }
    }
    
    if (req.query.dateTo && typeof req.query.dateTo === 'string') {
      const dateTo = new Date(req.query.dateTo);
      if (!isNaN(dateTo.getTime())) {
        filters.dateTo = dateTo;
      }
    }
    
    const result = await getAppointmentList(pagination, filters);
    
    // Transform to match frontend PaginatedResponse<T> interface
    res.json({
      success: true,
      data: {
        data: result.appointments,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
      message: 'Appointments retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve appointments',
        code: 'GET_APPOINTMENTS_ERROR',
      },
    });
  }
};

/**
 * Get platform statistics for admin dashboard
 * GET /api/admin/stats
 */
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getPlatformStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Platform statistics retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve platform statistics',
        code: 'GET_STATS_ERROR',
      },
    });
  }
};

/**
 * Update user status (suspend/activate)
 * PUT /api/admin/users/:id/status
 */
export const updateUserStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status. Must be ACTIVE or SUSPENDED',
          code: 'INVALID_STATUS',
        },
      });
      return;
    }
    
    // Validate user ID
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Valid user ID is required',
          code: 'INVALID_USER_ID',
        },
      });
      return;
    }
    
    const updatedUser = await updateUserStatus(id, status);
    
    res.json({
      success: true,
      data: updatedUser,
      message: `User status updated to ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user status',
        code: 'UPDATE_USER_STATUS_ERROR',
      },
    });
  }
};

/**
 * Get detailed user information by ID
 * GET /api/admin/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Valid user ID is required',
          code: 'INVALID_USER_ID',
        },
      });
      return;
    }
    
    const user = await getUserByIdService(id);
    
    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve user',
        code: 'GET_USER_ERROR',
      },
    });
  }
};

/**
 * Delete a user (admin only)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Valid user ID is required',
          code: 'INVALID_USER_ID',
        },
      });
      return;
    }
    
    await deleteUserService(id);
    
    res.json({
      success: true,
      data: null,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete user',
        code: 'DELETE_USER_ERROR',
      },
    });
  }
};

/**
 * Cancel an appointment (admin override)
 * PUT /api/admin/appointments/:id/cancel
 */
export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Valid appointment ID is required',
          code: 'INVALID_APPOINTMENT_ID',
        },
      });
      return;
    }
    
    // Admin can cancel any appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            expertise: true,
            bio: true,
            yearsExperience: true,
            ratingAverage: true
          }
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institute: true,
            course: true,
            goals: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    
    // Check if appointment was not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Appointment not found',
          code: 'APPOINTMENT_NOT_FOUND',
        },
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to cancel appointment',
        code: 'CANCEL_APPOINTMENT_ERROR',
      },
    });
  }
};