import prisma from '../config/database.js';

/**
 * Submit a new public enquiry
 * @param {object} data - Enquiry data
 * @returns {object} Created enquiry
 */
export const submitPublicEnquiry = async ({ name, email, courseInterest, phone }) => {
  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      email,
      courseInterest,
      phone: phone || null,
      status: 'PUBLIC',
      claimedById: null,
    },
  });

  return enquiry;
};

/**
 * Get all unclaimed public enquiries with pagination
 * @param {object} options - Pagination and sorting options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} options.sortOrder - 'asc' | 'desc'
 * @returns {object} Enquiries array and pagination metadata
 */
export const getPublicEnquiries = async ({ page, limit, sortOrder }) => {
  const skip = (page - 1) * limit;

  const [enquiries, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where: {
        status: 'PUBLIC',
        claimedById: null,
      },
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
    }),
    prisma.enquiry.count({
      where: {
        status: 'PUBLIC',
        claimedById: null,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    enquiries,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Claim an enquiry atomically - prevents race conditions
 * Uses a conditional update that only succeeds when status is PUBLIC and claimedById is null.
 * @param {string} enquiryId - The enquiry UUID
 * @param {string} employeeId - The employee UUID claiming the enquiry
 * @returns {object} Updated enquiry
 */
export const claimEnquiry = async (enquiryId, employeeId) => {
  // First verify the enquiry exists
  const existingEnquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
  });

  if (!existingEnquiry) {
    const error = new Error('Enquiry not found.');
    error.statusCode = 404;
    throw error;
  }

  // Atomic conditional update — only updates if status is PUBLIC and claimedById is null.
  // This prevents race conditions: if two employees try simultaneously, only one will succeed.
  const updatedEnquiry = await prisma.enquiry.updateMany({
    where: {
      id: enquiryId,
      status: 'PUBLIC',
      claimedById: null,
    },
    data: {
      status: 'CLAIMED',
      claimedById: employeeId,
    },
  });

  // If count is 0, the enquiry was already claimed (concurrent request won the race)
  if (updatedEnquiry.count === 0) {
    const error = new Error('This enquiry has already been claimed.');
    error.statusCode = 409;
    throw error;
  }

  // Fetch and return the updated enquiry
  const claimedEnquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: {
      claimedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return claimedEnquiry;
};

/**
 * Get enquiries claimed by a specific employee (private enquiries)
 * @param {string} employeeId - The employee UUID
 * @param {object} options - Pagination and sorting options
 * @returns {object} Enquiries array and pagination metadata
 */
export const getMyEnquiries = async (employeeId, { page, limit, sortOrder }) => {
  const skip = (page - 1) * limit;

  const [enquiries, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where: {
        claimedById: employeeId,
        status: 'CLAIMED',
      },
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
      include: {
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.enquiry.count({
      where: {
        claimedById: employeeId,
        status: 'CLAIMED',
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    enquiries,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
