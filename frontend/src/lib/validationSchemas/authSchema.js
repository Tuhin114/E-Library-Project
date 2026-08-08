import { z } from "zod";
import { ROLE_VALUES } from "@/constants/roles";

/**
 * Client-side mirror of backend/src/validators/authValidator.js.
 * Used with react-hook-form's zodResolver for instant field-level
 * feedback; the backend re-validates everything independently and
 * remains the actual source of truth.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(ROLE_VALUES).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Base schema mirroring the backend's changePasswordSchema. No
 * confirmNewPassword field here — ChangePasswordForm.jsx extends this
 * with one client-side-only, the same pattern RegisterForm.jsx uses.
 */
export const changePasswordBaseSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const changePasswordSchema = changePasswordBaseSchema.refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  },
);

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
});

/**
 * Base schema mirroring the backend's resetPasswordSchema.
 * ResetPasswordForm.jsx extends this with confirmNewPassword,
 * client-side-only — same pattern as the other password forms.
 */
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
