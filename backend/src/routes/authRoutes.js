import { Router } from 'express';
import { register } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { registerSchema } from '../validators/authValidator.js';

const router = Router();

// Stricter than the app-wide global limiter — registration is a common
// abuse target (spam accounts, email enumeration). 10 attempts/hour/IP.
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many registration attempts. Please try again later.',
});

router.post('/register', registerLimiter, validateRequest(registerSchema), register);

export default router;
