import prisma from '../utils/prisma';
import { UserWithoutPassword, AppointmentWithUsers, UserRole, AppointmentStatus } from '../types/database';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UserListResponse {
  users: UserWithoutPassword[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentListResponse {
  appointments: AppointmentWithUsers[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalMessages: number;
  recentRegistrations: number; // Last 30 days
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  mentorId?: string;
  menteeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserFilters {
  role?: UserRole;
  search?: string; // Search by name or email
}

/**
 * Get paginated list of users with optional filtering
 */
export const getUserList = async (
  pagination: PaginationParams,
  filters: UserFilters = {}
): Promise<UserListResponse> => {
  const { page, limit } = pagination;
  const { role, search } = filters;
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {};
  
  if (role) {
    where.role = role;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Get total count for pagination
  const total = await prisma.user.count({ where });
  
  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
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
      _count: {
        select: {
          mentorAppointments: true,
          menteeAppointments: true,
          ratingsReceived: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    users: users as any, // Type assertion since we're excluding password
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get paginated list of appointments with optional filtering
 */
export const getAppointmentList = async (
  pagination: PaginationParams,
  filters: AppointmentFilters = {}
): Promise<AppointmentListResponse> => {
  const { page, limit } = pagination;
  const { status, mentorId, menteeId, dateFrom, dateTo } = filters;
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (mentorId) {
    where.mentorId = mentorId;
  }
  
  if (menteeId) {
    where.menteeId = menteeId;
  }
  
  if (dateFrom || dateTo) {
    where.datetime = {};
    if (dateFrom) {
      where.datetime.gte = dateFrom;
    }
    if (dateTo) {
      where.datetime.lte = dateTo;
    }
  }
  
  // Get total count for pagination
  const total = await prisma.appointment.count({ where });
  
  // Get appointments with related user data
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      mentor: {
        select: {
          id: true,
          email: true,
          name: true,
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
      mentee: {
        select: {
          id: true,
          email: true,
          name: true,
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
      _count: {
        select: {
          messages: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  
  const totalPages = Math.ceil(total / limit);
  
  return {
    appointments: appointments as AppointmentWithUsers[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get platform statistics for admin dashboard
 */
export const getPlatformStats = async (): Promise<PlatformStats> => {
  // Get basic counts
  const [
    totalUsers,
    totalMentors,
    totalMentees,
    totalAppointments,
    completedAppointments,
    pendingAppointments,
    cancelledAppointments,
    totalMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'MENTOR' } }),
    prisma.user.count({ where: { role: 'MENTEE' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { status: { in: ['REQUESTED', 'ACCEPTED'] } } }),
    prisma.appointment.count({ where: { status: 'CANCELLED' } }),
    prisma.message.count(),
  ]);
  
  // Get average rating
  const ratingStats = await prisma.rating.aggregate({
    _avg: {
      score: true,
    },
  });
  
  // Get recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRegistrations = await prisma.user.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });
  
  return {
    totalUsers,
    totalMentors,
    totalMentees,
    totalAppointments,
    completedAppointments,
    pendingAppointments,
    cancelledAppointments,
    averageRating: ratingStats._avg.score || 0,
    totalMessages,
    recentRegistrations,
  };
};

/**
 * Get user by ID with detailed information
 */
export const getUserById = async (userId: string): Promise<UserWithoutPassword> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
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
      _count: {
        select: {
          mentorAppointments: true,
          menteeAppointments: true,
          ratingsReceived: true,
          ratingsGiven: true,
          sentMessages: true,
        },
      },
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user as any; // Type assertion since we're excluding password
};

/**
 * Update user status (for admin actions like suspend/activate)
 */
export const updateUserStatus = async (
  userId: string,
  _status: 'ACTIVE' | 'SUSPENDED'
): Promise<UserWithoutPassword> => {
  // Note: We'll need to add a status field to the User model in the future
  // For now, we'll just return the user as-is since the schema doesn't have a status field
  const user = await getUserById(userId);
  
  // TODO: Implement actual status update when status field is added to schema
  // For now, just return the user
  return user;
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  // First, verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Delete user's related data first (due to foreign key constraints)
  // Delete ratings where user was the rater or ratee
  await prisma.rating.deleteMany({
    where: {
      OR: [
        { raterId: userId },
        { ratedId: userId },
      ],
    },
  });
  
  // Delete messages sent or received by user
  await prisma.message.deleteMany({
    where: {
      OR: [
        { fromId: userId },
        { toId: userId },
      ],
    },
  });
  
  // Delete appointments where user was mentor or mentee
  await prisma.appointment.deleteMany({
    where: {
      OR: [
        { mentorId: userId },
        { menteeId: userId },
      ],
    },
  });
  
  // Finally, delete the user
  await prisma.user.delete({
    where: { id: userId },
  });
};