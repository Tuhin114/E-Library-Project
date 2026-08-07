import { ApiError } from '../utils/ApiError.js';

/**
 * Generic request body validation middleware factory.
 * Validates req.body against the given Zod schema, replaces req.body
 * with the parsed (trimmed/coerced) result so downstream code always
 * works with clean data, and forwards a 422 ApiError with field-level
 * details on failure.
 *
 * Usage: router.post('/register', validateRequest(registerSchema), register)
 */
export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(422, 'Validation failed', details));
  }

  req.body = result.data;
  next();
};
