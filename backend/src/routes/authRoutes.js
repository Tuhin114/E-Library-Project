import { Router } from "express";
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidator.js";

const router = Router();

// Stricter than the app-wide global limiter — registration is a common
// abuse target (spam accounts, email enumeration). 10 attempts/hour/IP.
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please try again later.",
});

// Tighter window than register — brute-forcing a known email's password
// is the primary threat here. 10 attempts per 15 minutes per IP.
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

// Looser than login — called automatically on every app load and,
// as of M7, transparently by the frontend whenever an access token
// expires mid-session, so it needs headroom for normal use.
const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many refresh attempts. Please log in again.",
});

// Same window/threshold as login — this endpoint requires the current
// password, so it's an equivalent brute-force target.
const changePasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Please try again later.",
});

// Tighter than most — each request costs a real email send, and this
// is a classic target for email-bombing abuse. 5 per hour per IP.
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});

// Guessing a valid reset token is the threat here, not credential
// brute-forcing — tokens are 32 bytes of randomness, so this mainly
// guards against accidental request storms, not realistic attacks.
const resetPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Please try again later.",
});

router.post(
  "/register",
  registerLimiter,
  validateRequest(registerSchema),
  register,
);
router.post("/login", loginLimiter, validateRequest(loginSchema), login);
router.post("/refresh-token", refreshLimiter, refresh);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);
router.patch(
  "/change-password",
  authenticate,
  changePasswordLimiter,
  validateRequest(changePasswordSchema),
  changePassword,
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateRequest(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetPasswordLimiter,
  validateRequest(resetPasswordSchema),
  resetPassword,
);

export default router;
