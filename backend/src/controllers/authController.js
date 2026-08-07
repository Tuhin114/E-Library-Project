import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as authService from '../services/authService.js';

/**
 * POST /api/auth/register
 * Creates a new user account.
 * req.body has already been validated and sanitized by validateRequest(registerSchema).
 */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, 'Account created successfully. Please log in.', { user }));
});
