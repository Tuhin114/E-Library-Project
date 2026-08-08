import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { loginSchema } from "@/lib/validationSchemas/authSchema";
import { loginUser } from "@/store/slices/authSlice";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Login form. Dispatches the `loginUser` thunk directly (rather than
 * going through authService in the component) since Redux is already
 * the source of truth for session state — the thunk itself calls
 * authService internally.
 */
export function LoginForm({ onSuccess }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success("Logged in successfully.");
      onSuccess?.();
    } catch (message) {
      toast.error(
        typeof message === "string"
          ? message
          : "Login failed. Please try again.",
      );
    }
  };

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
