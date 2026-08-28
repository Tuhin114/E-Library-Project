import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.STUDENT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },
    // Category-level only (not per-type) — three categories x two
    // channels is the right granularity for a v1; per-type toggles
    // would be real over-engineering. `community.email` defaults off
    // since forum/discussion replies are frequent and low-stakes
    // compared to circulation/account events.
    notificationPreferences: {
      circulation: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
      },
      community: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
      account: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Hash the password before saving, but only when it has actually been
 * modified — avoids re-hashing an already-hashed password on unrelated
 * document updates (e.g. changing `name`).
 */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Only relevant when changing an existing password, not on first creation.
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

/**
 * Compares a plaintext candidate password against the stored hash.
 * Consumed by the login flow (M4).
 */
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Strips sensitive/internal fields whenever a user document is
 * serialized (e.g. included in an API response), so they can never
 * leak by accident even if a route forgets to `.select('-password')`.
 */
userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordChangedAt;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
