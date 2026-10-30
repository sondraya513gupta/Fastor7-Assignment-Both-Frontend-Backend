import { z } from 'zod';

export const submitEnquirySchema = z.object({
  name: z
    .string({ required_error: 'Student name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email format'),

  courseInterest: z
    .string({ required_error: 'Course interest is required' })
    .trim()
    .min(2, 'Course interest must be at least 2 characters')
    .max(200, 'Course interest must not exceed 200 characters'),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, 'Page must be at least 1')),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100, 'Limit must not exceed 100')),

  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});
