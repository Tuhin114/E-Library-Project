import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { corsOptions } from './config/corsOptions.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Security headers
app.use(helmet());

// Cross-origin resource sharing
app.use(cors(corsOptions));

// Body & cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookieSecret));

// Request logging (development only)
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

// Global rate limiter — protects the whole API from abuse.
// Stricter, route-specific limiters (e.g. for /auth/login) are added
// at the router level starting M4.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'E-Library API is running' });
});

// Feature routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Temporary global error handler.
// Will be extracted into middleware/errorHandler.js with a proper
// ApiError class in M10 — kept minimal here so early milestones don't
// leak unhandled stack traces to clients.
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.details && { details: err.details }),
    ...(env.isDevelopment && { stack: err.stack }),
  });
});

export default app;
