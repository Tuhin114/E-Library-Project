import { useNavigate, Link } from 'react-router-dom';
import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function Register() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Registration deliberately does not log the user in (see M3/M4
    // milestone split) — send them to login with a success hint.
    navigate('/login', { state: { justRegistered: true } });
  };

  return (
    <AuthCard
      title="Create your account"
      description="Join E-Library to access the digital collection."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm onSuccess={handleSuccess} />
    </AuthCard>
  );
}
