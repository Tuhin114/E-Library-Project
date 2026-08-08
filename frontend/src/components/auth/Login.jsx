import { useNavigate, Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";

/**
 * Previously derived its description text from router `location.state`
 * set by whichever page redirected here (just registered / changed
 * password / reset password). Replaced by toast notifications fired
 * from those pages instead — the Toaster is mounted at the App level
 * so it survives the navigate() call, and this page no longer needs to
 * know why the user arrived.
 */
export default function Login() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your E-Library account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </>
      }
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
