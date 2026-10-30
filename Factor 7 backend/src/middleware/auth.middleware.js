import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';

/**
 * JWT Authentication middleware
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches the authenticated employee to req.employee
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Authentication token is missing.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please log in again.');
      }
      if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token. Please log in again.');
      }
      throw err;
    }

    const employeeId = decoded.sub;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, email: true },
    });

    if (!employee) {
      return sendError(res, 401, 'Employee account not found. Please log in again.');
    }

    req.employee = employee;
    next();
  } catch (error) {
    next(error);
  }
};
