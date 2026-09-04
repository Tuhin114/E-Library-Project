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
import copyRoutes from "./routes/copyRoutes.js";
import physicalRequestRoutes from "./routes/physicalRequestRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import librarySettingsRoutes from "./routes/librarySettingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

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

// Phase 9 M2 — Razorpay's webhook signature is an HMAC over the exact
// raw bytes it sent, so this route needs the unparsed body. Mounted
// ahead of the global express.json() below, scoped to this one path
// only, so every other route still gets a normally-parsed JSON body.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

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
app.use("/api/copies", copyRoutes);
app.use("/api/requests", physicalRequestRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/settings", librarySettingsRoutes);
app.use("/api/me", notificationRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/resources", resourceRoutes);

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler.
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
