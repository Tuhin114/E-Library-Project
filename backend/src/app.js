import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { corsOptions } from "./config/corsOptions.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import publisherRoutes from "./routes/publisherRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import userLibraryRoutes from "./routes/userLibraryRoutes.js";
import readingRoutes from "./routes/readingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import discussionReplyRoutes from "./routes/discussionReplyRoutes.js";
import forumThreadRoutes from "./routes/forumThreadRoutes.js";
import forumReplyRoutes from "./routes/forumReplyRoutes.js";
import forumReportRoutes from "./routes/forumReportRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// Trust the first proxy hop (Render/Railway/any PaaS sit behind a reverse
// proxy). Required for express-rate-limit to read the real client IP from
// X-Forwarded-For instead of throwing, and for req.secure to resolve
// correctly behind TLS-terminating proxies.
app.set("trust proxy", 1);

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
  app.use(morgan("dev"));
}

// Global rate limiter — protects the whole API from abuse.
// Stricter, route-specific limiters (e.g. for /auth/login) are added
// at the router level starting M4.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(globalLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "E-Library API is running" });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/me", userLibraryRoutes);
app.use("/api/me", readingRoutes);
app.use("/api/me", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/discussion-replies", discussionReplyRoutes);
app.use("/api/forum/threads", forumThreadRoutes);
app.use("/api/forum/replies", forumReplyRoutes);
app.use("/api/forum/reports", forumReportRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
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
    message: err.message || "Internal server error",
    ...(err.details && { details: err.details }),
    ...(env.isDevelopment && { stack: err.stack }),
  });
});

export default app;
