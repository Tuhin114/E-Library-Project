import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it after all?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
