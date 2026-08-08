import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "react-router-dom";

import { resetPasswordSchema } from "@/lib/validationSchemas/authSchema";
import * as authService from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Form-only schema: extends the shared base schema with a
// confirmNewPassword field that only exists client-side — same
// pattern as RegisterForm.jsx and ChangePasswordForm.jsx.
const resetPasswordFormSchema = resetPasswordSchema
  .extend({
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

/**
 * Reset password form. The token comes from the URL (see
 * routes/AppRoutes.jsx: /reset-password/:token), not a form field —
 * the user never sees or types it, it's embedded in the emailed link.
 */
export function ResetPasswordForm({ onSuccess }) {
  const { token } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = async (values) => {
    try {
      await authService.resetPassword(token, values.newPassword);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="At least 8 characters"
          error={!!errors.newPassword}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input
          id="confirmNewPassword"
          type="password"
          error={!!errors.confirmNewPassword}
          {...register("confirmNewPassword")}
        />
        {errors.confirmNewPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}
