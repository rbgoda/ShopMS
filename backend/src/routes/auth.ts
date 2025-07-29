import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin, handleValidation } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Public routes
router.post('/register', authLimiter, validateRegister, handleValidation, register);
router.post('/login', authLimiter, validateLogin, handleValidation, login);

// Protected routes
router.use(authenticate);
router.get('/profile', generalLimiter, getProfile);
router.put('/profile', generalLimiter, updateProfile);
router.put('/change-password', authLimiter, changePassword);

export default router;