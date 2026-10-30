import * as enquiryService from '../services/enquiry.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * POST /api/enquiries/public
 * Submit a new public enquiry (no authentication required)
 */
export const submitPublicEnquiry = async (req, res, next) => {
  try {
    const { name, email, courseInterest, phone } = req.body;
    const enquiry = await enquiryService.submitPublicEnquiry({ name, email, courseInterest, phone });

    return sendSuccess(res, 201, 'Enquiry submitted successfully.', enquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/enquiries/public
 * Get all unclaimed public enquiries (authentication required)
 */
export const getPublicEnquiries = async (req, res, next) => {
  try {
    const { page, limit, sortOrder } = req.query;
    const { enquiries, pagination } = await enquiryService.getPublicEnquiries({
      page,
      limit,
      sortOrder,
    });

    return sendSuccess(
      res,
      200,
      'Public enquiries fetched successfully.',
      enquiries,
      pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/enquiries/:id/claim
 * Claim an available enquiry (authentication required)
 */
export const claimEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employeeId = req.employee.id;

    const enquiry = await enquiryService.claimEnquiry(id, employeeId);

    return sendSuccess(res, 200, 'Enquiry claimed successfully.', enquiry);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/enquiries/my
 * Get the logged-in employee's private claimed enquiries
 */
export const getMyEnquiries = async (req, res, next) => {
  try {
    const employeeId = req.employee.id;
    const { page, limit, sortOrder } = req.query;

    const { enquiries, pagination } = await enquiryService.getMyEnquiries(employeeId, {
      page,
      limit,
      sortOrder,
    });

    return sendSuccess(
      res,
      200,
      'Your enquiries fetched successfully.',
      enquiries,
      pagination
    );
  } catch (error) {
    next(error);
  }
};
