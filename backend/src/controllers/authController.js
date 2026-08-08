import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import * as authService from "../services/authService.js";

/**
 * POST /api/auth/register
 * Creates a new user account.
 * req.body has already been validated and sanitized by validateRequest(registerSchema).
 */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res
    .status(201)
    .json(
      new ApiResponse(201, "Account created successfully. Please log in.", {
        user,
      }),
    );
});

/**
 * POST /api/auth/login
 * Authenticates the user, issues a short-lived access token in the
 * response body and a long-lived refresh token as an httpOnly cookie.
 * req.body has already been validated by validateRequest(loginSchema).
 */
export const login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json(
    new ApiResponse(200, "Logged in successfully", {
      user: user.toJSON(),
      accessToken,
    }),
  );
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 * Protected by the `authenticate` middleware, which has already
 * verified the access token and attached the fresh user to req.user.
 */
export const getMe = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, "Current user fetched", { user: req.user.toJSON() }),
    );
});

/**
 * POST /api/auth/refresh-token
 * Reissues a short-lived access token from the httpOnly refresh-token
 * cookie, without requiring the user to log in again. Used by the
 * frontend on app load to rehydrate the session after a page refresh.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  const user = await authService.verifyRefreshToken(token);
  const accessToken = generateAccessToken(user);

  res.status(200).json(
    new ApiResponse(200, "Token refreshed", {
      user: user.toJSON(),
      accessToken,
    }),
  );
});

/**
 * POST /api/auth/logout
 * Clears the refresh-token cookie, ending the session server-side.
 * The access token itself isn't invalidated (it's stateless and
 * short-lived by design) — it simply stops being renewable once the
 * cookie is gone, so it expires naturally within JWT_ACCESS_EXPIRY.
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

/**
 * PATCH /api/auth/change-password
 * Changes the authenticated user's password after verifying the
 * current one. Also clears the refresh-token cookie — a password
 * change is a security-sensitive event, so this device's session ends
 * too and the user re-authenticates with the new password. (There's no
 * server-side token blacklist in this project, so other
 * already-issued access tokens elsewhere remain valid until they
 * naturally expire — an accepted tradeoff at this scope.)
 */
export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);

  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password changed successfully. Please log in again.",
      ),
    );
});

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email if the address belongs to an account.
 * Always responds with the same generic message regardless of whether
 * the account exists — authService.requestPasswordReset resolves
 * silently for unknown emails, so there's no timing/response
 * difference an attacker could use to enumerate registered addresses.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "If an account exists with that email, a password reset link has been sent.",
      ),
    );
});

/**
 * POST /api/auth/reset-password/:token
 * Completes a password reset using the raw token from the emailed
 * link. Also clears the refresh-token cookie, same policy as
 * change-password — a reset is a security-sensitive event that ends
 * the current session.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.newPassword);

  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  res
    .status(200)
    .json(new ApiResponse(200, "Password reset successful. Please log in."));
});
