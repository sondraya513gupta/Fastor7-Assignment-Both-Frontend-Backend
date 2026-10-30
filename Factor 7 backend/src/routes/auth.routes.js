import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new employee account
 */
router.post('/register', authRateLimit, validateBody(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login an existing employee
 */
router.post('/login', authRateLimit, validateBody(loginSchema), authController.login);

export default router;
