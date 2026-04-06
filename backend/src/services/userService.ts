import prisma from '../utils/prisma';
import { TransformedUser, UserRole, TimeSlot } from '../types/database';

export interface UpdateProfileData {
  name?: string;
  // Mentor-specific fields
  expertise?: string[];
  bio?: string;
  yearsExperience?: number;
  availabilitySlots?: TimeSlot[];
  // Mentee-specific fields
  institute?: string;
  course?: string;
  goals?: string;
}

export interface MentorSearchFilters {
  expertise?: string;
  availability?: boolean;
  page: number;
  limit: number;
}

export interface MentorSearchResult {
  mentors: MentorWithRating[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MentorWithRating extends Omit<TransformedUser, 'expertise'> {
  expertise?: string | null;
  ratingsReceived: Array<{
    score: number;
    comments: string | null;
    createdAt: Date;
    rater: {
      name: string;
    };
  }>;
}

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<TransformedUser | null> => {
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
    },
  });

  if (!user) return null;

  // Parse availability slots if they exist
  let availabilitySlots: TimeSlot[] = [];
  if (user.availabilitySlots) {
    try {
      availabilitySlots = JSON.parse(user.availabilitySlots);
    } catch (error) {
      console.error('Error parsing availability slots:', error);
    }
  }

  // Parse expertise if it exists
  let expertise: string[] = [];
  if (user.expertise) {
    try {
      // expertise is stored as comma-separated string, not JSON
      expertise = user.expertise.split(',').map(skill => skill.trim());
    } catch (error) {
      console.error('Error parsing expertise:', error);
    }
  }

  return {
    ...user,
    role: user.role as UserRole,
    expertise,
    availabilitySlots,
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<TransformedUser> => {
  console.log('updateUserProfile called with:', { userId, data });
  
  // Get current user to validate role-specific updates
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!currentUser) {
    throw new Error('User not found');
  }

  console.log('Current user role:', currentUser.role);

  // Validate role-specific fields
  if (currentUser.role === 'MENTOR') {
    // Validate mentor-specific fields
    if (data.institute !== undefined || data.course !== undefined || data.goals !== undefined) {
      throw new Error('Mentors cannot update mentee-specific fields');
    }
  } else if (currentUser.role === 'MENTEE') {
    // Validate mentee-specific fields
    if (
      data.expertise !== undefined ||
      data.bio !== undefined ||
      data.yearsExperience !== undefined ||
      data.availabilitySlots !== undefined
    ) {
      throw new Error('Mentees cannot update mentor-specific fields');
    }
  }

  // Prepare update data
  const updateData: any = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error('Name cannot be empty');
    }
    updateData.name = data.name.trim();
  }

  // Mentor-specific updates
  if (currentUser.role === 'MENTOR') {
    if (data.expertise !== undefined) {
      if (!Array.isArray(data.expertise) || data.expertise.length === 0) {
        throw new Error('Expertise must be a non-empty array');
      }
      // Store expertise as comma-separated string to match existing data format
      updateData.expertise = data.expertise.join(',');
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio.trim() || null;
    }

    if (data.yearsExperience !== undefined) {
      if (data.yearsExperience < 0) {
        throw new Error('Years of experience cannot be negative');
      }
      updateData.yearsExperience = data.yearsExperience;
    }

    if (data.availabilitySlots !== undefined) {
      if (!Array.isArray(data.availabilitySlots)) {
        throw new Error('Availability slots must be an array');
      }
      // Validate time slot format
      for (const slot of data.availabilitySlots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          throw new Error('Each availability slot must have day, startTime, and endTime');
        }
      }
      updateData.availabilitySlots = JSON.stringify(data.availabilitySlots);
    }
  }

  // Mentee-specific updates
  if (currentUser.role === 'MENTEE') {
    if (data.institute !== undefined) {
      updateData.institute = data.institute.trim() || null;
    }

    if (data.course !== undefined) {
      updateData.course = data.course.trim() || null;
    }

    if (data.goals !== undefined) {
      updateData.goals = data.goals.trim() || null;
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
  });

  // Parse availability slots if they exist
  let availabilitySlots: TimeSlot[] = [];
  if (updatedUser.availabilitySlots) {
    try {
      availabilitySlots = JSON.parse(updatedUser.availabilitySlots);
    } catch (error) {
      console.error('Error parsing availability slots:', error);
    }
  }

  // Parse expertise if it exists
  let expertise: string[] = [];
  if (updatedUser.expertise) {
    try {
      // expertise is stored as comma-separated string, not JSON
      expertise = updatedUser.expertise.split(',').map(skill => skill.trim());
    } catch (error) {
      console.error('Error parsing expertise:', error);
    }
  }

  return {
    ...updatedUser,
    role: updatedUser.role as UserRole,
    expertise,
    availabilitySlots,
  };
};
/**
 * S
earch mentors with filters
 */
export const searchMentors = async (filters: MentorSearchFilters): Promise<MentorSearchResult> => {
  const { expertise, availability, page, limit } = filters;

  // Build where clause
  const where: any = {
    role: 'MENTOR',
  };

  // Filter by expertise if provided
  if (expertise) {
    where.expertise = {
      contains: expertise,
    };
  }

  // Filter by availability if requested
  if (availability) {
    where.availabilitySlots = {
      not: null,
    };
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Get mentors with ratings
  const mentors = await prisma.user.findMany({
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
      ratingsReceived: {
        select: {
          score: true,
          comments: true,
          createdAt: true,
          rater: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // Get latest 5 ratings
      },
    },
    skip,
    take: limit,
    orderBy: [
      { ratingAverage: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Transform mentors data
  const transformedMentors: MentorWithRating[] = mentors.map((mentor) => {
    let availabilitySlots: TimeSlot[] = [];
    if (mentor.availabilitySlots) {
      try {
        availabilitySlots = JSON.parse(mentor.availabilitySlots);
      } catch (error) {
        console.error('Error parsing availability slots:', error);
      }
    }

    // Keep expertise as comma-separated string for consistency
    const expertise = mentor.expertise || null;

    return {
      ...mentor,
      role: mentor.role as UserRole,
      expertise,
      availabilitySlots,
      ratingsReceived: mentor.ratingsReceived,
    };
  });

  return {
    mentors: transformedMentors,
    total,
    page,
    totalPages,
  };
};

/**
 * Get mentor details with ratings and availability
 */
export const getMentorDetails = async (mentorId: string): Promise<MentorWithRating | null> => {
  const mentor = await prisma.user.findFirst({
    where: {
      id: mentorId,
      role: 'MENTOR',
    },
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
      ratingsReceived: {
        select: {
          score: true,
          comments: true,
          createdAt: true,
          rater: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!mentor) return null;

  // Parse availability slots
  let availabilitySlots: TimeSlot[] = [];
  if (mentor.availabilitySlots) {
    try {
      availabilitySlots = JSON.parse(mentor.availabilitySlots);
    } catch (error) {
      console.error('Error parsing availability slots:', error);
    }
  }

  // Keep expertise as comma-separated string for consistency
  const expertise = mentor.expertise || null;

  return {
    ...mentor,
    role: mentor.role as UserRole,
    expertise,
    availabilitySlots,
    ratingsReceived: mentor.ratingsReceived,
  };
};