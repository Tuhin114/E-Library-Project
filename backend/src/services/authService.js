import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import {
  generateResetToken,
  hashResetToken,
} from "../utils/generateResetToken.js";
import { sendPasswordResetEmail } from "./emailService.js";

/**
 * Registers a new user.
 * Holds all registration business logic (duplicate-email check, model
 * creation) so the controller stays a thin HTTP-layer adapter and this
 * logic stays reusable/testable independently of Express.
 *
 * Deliberately does NOT issue tokens or log the user in — registration
 * and login are separate flows. The client redirects to the login page
 * on success.
 */
export const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role });

  return user.toJSON();
};

/**
 * Authenticates a user by email + password.
 * Returns the Mongoose document (not .toJSON()) so the controller can
 * still access it for token generation before serializing the response.
 * Uses a single generic error message for both "no such user" and
 * "wrong password" so failed attempts can't be used to enumerate
 * registered email addresses.
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "This account has been deactivated. Please contact support.",
    );
  }

  return user;
};

/**
 * Verifies a refresh token (read from the httpOnly cookie by the
 * controller) and returns the user it belongs to.
 * Used to silently reissue an access token without asking the user to
 * log in again — e.g. on app load, or when an access token expires
 * mid-session (interceptor added in M7).
 */
export const verifyRefreshToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, env.jwt.refreshSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Account no longer exists or is inactive");
  }

  return user;
};

/**
 * Changes a user's password after verifying their current one.
 * Mongoose's pre-save hook on the User model handles hashing — this
 * only needs to assign the new plaintext value and save.
 */
export const changePassword = async (
  userId,
  { currentPassword, newPassword },
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
};

/**
 * Generates and emails a password reset token.
 * Resolves the same way (silently) whether or not the account exists —
 * the controller sends one generic response either way, so this
 * endpoint can't be used to discover which emails are registered.
 */
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });

  if (!user) return;

  const { resetToken, hashedToken, expiresAt } = generateResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl);
  } catch (error) {
    // The email genuinely couldn't be sent — roll back the token so the
    // user isn't left holding a "valid" reset request with no way to
    // ever have received the link for it.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      500,
      "Could not send password reset email. Please try again later.",
    );
  }
};

/**
 * Completes a password reset given the raw token from the reset link.
 * Also implicitly ends the session on whichever device calls this
 * (see the controller, which clears the refresh cookie) — same policy
 * as changePassword().
 */
export const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = hashResetToken(rawToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};
