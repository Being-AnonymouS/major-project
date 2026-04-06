import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  getMentors, 
  getMentorById 
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateProfileUpdate, 
  validateMentorSearch 
} from '../middleware/validation';

const router = Router();

// Get current user's profile
router.get('/profile', authenticateToken, getProfile);

// Update current user's profile
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

// Search mentors with filters
router.get('/mentors', validateMentorSearch, getMentors);

// Get specific mentor details
router.get('/mentors/:id', getMentorById);

export default router;