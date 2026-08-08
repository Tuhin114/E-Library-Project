import { useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { toast } from "@/hooks/useToast";

export default function ChangePassword() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // The backend already cleared this device's session as part of the
    // password change — send the user to log in with the new password.
    toast.success("Password changed successfully. Please log in again.");
    navigate("/login", { replace: true });
  };

  return (
    <AuthCard
      title="Change your password"
      description="You'll need to log in again once it's changed."
    >
      <ChangePasswordForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
