import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { registerSchema } from "@/lib/validationSchemas/authSchema";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import * as authService from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Public self-registration is intentionally limited to student/faculty.
// Librarian accounts carry elevated privileges and are provisioned by
// an admin/librarian, never granted via open self-signup.
const SELF_REGISTRATION_ROLES = [ROLES.STUDENT, ROLES.FACULTY];

// Form-only schema: extends the shared base schema with a confirmPassword
// field that only exists client-side (the backend never receives it).
const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Registration form. On success, calls `onSuccess` so the parent page
 * decides what happens next (currently: redirect to /login).
 */
export function RegisterForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: ROLES.STUDENT },
  });

  const onSubmit = async (values) => {
    try {
      const { confirmPassword, ...payload } = values;
      const { user } = await authService.register(payload);
      onSuccess?.(user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          placeholder="Jane Doe"
          error={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@university.edu"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">I am a</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {SELF_REGISTRATION_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          error={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
