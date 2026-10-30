import { sendError } from '../utils/response.js';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Log the error (without sensitive data)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return sendError(res, 409, 'A record with this information already exists.');
  }

  if (err.code === 'P2025') {
    return sendError(res, 404, 'Record not found.');
  }

  if (err.code === 'P2003') {
    return sendError(res, 400, 'Invalid reference: related record not found.');
  }

  // JWT errors (should be caught in middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token has expired.');
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message || 'An internal server error occurred.';

  return sendError(res, statusCode, message);
};

/**
 * 404 Not Found handler for unknown routes
 */
export const notFoundHandler = (req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found.`);
};
