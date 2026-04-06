import { Request, Response } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  searchMentors, 
  getMentorDetails 
} from '../services/userService';

/**
 * Get current user's profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const profile = await getUserProfile(req.user.userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { profile },
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get profile';
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'GET_PROFILE_FAILED',
      },
    });
  }
};

/**
 * Update current user's profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    console.log('Update profile request body:', req.body);
    const updatedProfile = await updateUserProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('Profile update error:', error);
    
    res.status(400).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'UPDATE_PROFILE_FAILED',
      },
    });
  }
};

/**
 * Search mentors with filters
 */
export const getMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { expertise, availability, page = '1', limit = '10' } = req.query;

    const filters = {
      expertise: expertise as string,
      availability: availability === 'true',
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await searchMentors(filters);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Mentors retrieved successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search mentors';
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'SEARCH_MENTORS_FAILED',
      },
    });
  }
};

/**
 * Get specific mentor details with ratings and availability
 */
export const getMentorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Mentor ID is required',
          code: 'MENTOR_ID_REQUIRED',
        },
      });
      return;
    }

    const mentor = await getMentorDetails(id);

    if (!mentor) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Mentor not found',
          code: 'MENTOR_NOT_FOUND',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { mentor },
      message: 'Mentor details retrieved successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get mentor details';
    
    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: 'GET_MENTOR_FAILED',
      },
    });
  }
};