import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

/**
 * Middleware factory for validating request body against a Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 400, 'Validation failed', errors);
    }
    next(error);
  }
};

/**
 * Middleware factory for validating query parameters against a Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 400, 'Invalid query parameters', errors);
    }
    next(error);
  }
};
