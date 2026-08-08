import { useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { toast } from "@/hooks/useToast";

export default function ResetPassword() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Password reset successfully. Please log in.");
    navigate("/login", { replace: true });
  };

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your account."
    >
      <ResetPasswordForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
