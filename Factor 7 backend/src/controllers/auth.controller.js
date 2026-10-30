import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * POST /api/auth/register
 * Register a new employee account
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { employee, token } = await authService.registerEmployee({ name, email, password });

    return sendSuccess(res, 201, 'Employee registered successfully.', { employee, token });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login an existing employee
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { employee, token } = await authService.loginEmployee({ email, password });

    return sendSuccess(res, 200, 'Login successful.', { employee, token });
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
