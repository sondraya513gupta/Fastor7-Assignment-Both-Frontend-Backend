import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

/**
 * Rate limiter for authentication endpoints (register/login)
 * Stricter limits to protect against brute force attacks
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: undefined,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Too many authentication attempts. Please try again after 15 minutes.'
    );
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter for the public enquiry submission endpoint
 * Prevents spam submissions from the same IP
 */
export const publicEnquiryRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: undefined,
  handler: (req, res) => {
    return sendError(
      res,
      429,
      'Too many enquiry submissions from this IP. Please try again after 1 hour.'
    );
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: undefined,
  handler: (req, res) => {
    return sendError(res, 429, 'Too many requests. Please slow down.');
  },
  skip: () => process.env.NODE_ENV === 'test',
});
