import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Registers a new user.
 * Holds all registration business logic (duplicate-email check, model
 * creation) so the controller stays a thin HTTP-layer adapter and this
 * logic stays reusable/testable independently of Express.
 *
 * Deliberately does NOT issue tokens or log the user in — registration
 * and login are separate flows (see M4). The client redirects to the
 * login page on success.
 */
export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  return user.toJSON();
};
