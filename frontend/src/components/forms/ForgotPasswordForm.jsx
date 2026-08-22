import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema } from "@/lib/validationSchemas/authSchema";
import * as authService from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Requests a password reset email.
 * Deliberately shows the same generic success message regardless of
 * whether the email is registered (matching the backend's response) —
 * revealing the difference here would defeat the point of the backend
 * not revealing it either.
 *
 * The success confirmation stays as a persistent inline panel rather
 * than a toast — unlike a transient error, "check your email" is
 * something the user needs to still see if they look away and back,
 * not something that should disappear after a few seconds.
 */
export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    try {
      const message = await authService.forgotPassword(values.email);
      setSuccessMessage(message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (successMessage) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground"
      >
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
