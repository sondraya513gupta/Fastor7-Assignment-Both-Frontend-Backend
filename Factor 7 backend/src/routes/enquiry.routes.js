import { Router } from 'express';
import * as enquiryController from '../controllers/enquiry.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { submitEnquirySchema, paginationSchema } from '../validators/enquiry.validator.js';
import { publicEnquiryRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * POST /api/enquiries/public
 * Submit a new public enquiry — NO authentication required
 * Rate limited to prevent spam
 */
router.post(
  '/public',
  publicEnquiryRateLimit,
  validateBody(submitEnquirySchema),
  enquiryController.submitPublicEnquiry
);

/**
 * GET /api/enquiries/public
 * Fetch all unclaimed public enquiries — authentication required
 */
router.get(
  '/public',
  authenticate,
  validateQuery(paginationSchema),
  enquiryController.getPublicEnquiries
);

/**
 * GET /api/enquiries/my
 * Fetch the logged-in employee's claimed enquiries — authentication required
 */
router.get(
  '/my',
  authenticate,
  validateQuery(paginationSchema),
  enquiryController.getMyEnquiries
);

/**
 * PATCH /api/enquiries/:id/claim
 * Claim a specific enquiry — authentication required
 */
router.patch('/:id/claim', authenticate, enquiryController.claimEnquiry);

export default router;
