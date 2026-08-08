import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { changePasswordBaseSchema } from "@/lib/validationSchemas/authSchema";
import { changeUserPassword } from "@/store/slices/authSlice";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Form-only schema: extends the shared base schema with a
// confirmNewPassword field that only exists client-side — same
// pattern as RegisterForm.jsx's registerFormSchema.
const changePasswordFormSchema = changePasswordBaseSchema
  .extend({
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

/**
 * Change password form. On success, the backend has already ended the
 * current session (see the /change-password controller) — `onSuccess`
 * is where the parent page sends the user to re-authenticate.
 */
export function ChangePasswordForm({ onSuccess }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordFormSchema) });

  const onSubmit = async (values) => {
    try {
      const { confirmNewPassword, ...payload } = values;
      await dispatch(changeUserPassword(payload));
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          error={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

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
        Change password
      </Button>
    </form>
  );
}
