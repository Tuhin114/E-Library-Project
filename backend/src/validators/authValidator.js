import { z } from 'zod';
import { ROLE_VALUES } from '../constants/roles.js';

/**
 * Validation schema for user registration requests.
 * Mirrors the frontend copy at
 * frontend/src/lib/validationSchemas/authSchema.js so both layers reject
 * invalid input identically — the backend remains the source of truth,
 * the frontend copy exists purely for instant UX feedback.
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  // Role is optional on registration; defaults to "student" at the model
  // level. Only exposed as a choice where the registration flow needs it.
  role: z.enum(ROLE_VALUES).optional(),
});

/**
 * Validation schema for user login requests.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});
