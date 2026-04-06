import { Router } from 'express';
import { register, login, getMe, logout, refreshToken } from '../controllers/authController';
import { authenticateWithRefresh } from '../middleware/tokenRefresh';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { logoutWithTokenInvalidation } from '../middleware/tokenRefresh';
import { registrationRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', registrationRateLimit, validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logoutWithTokenInvalidation, logout);

// Protected routes
router.get('/me', authenticateWithRefresh, getMe);

export default router;