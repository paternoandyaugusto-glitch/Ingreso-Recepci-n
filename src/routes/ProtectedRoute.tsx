import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const validateSession = useAuthStore((state) => state.validateSession);
  const touchSession = useAuthStore((state) => state.touchSession);

  useEffect(() => {
    if (!validateSession()) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const events: Array<keyof WindowEventMap> = ['click', 'touchstart', 'keydown', 'mousemove'];
    const handleActivity = () => touchSession();
    events.forEach((event) => window.addEventListener(event, handleActivity));

    const interval = window.setInterval(() => {
      if (!validateSession()) navigate('/admin/login', { replace: true });
    }, 30_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      window.clearInterval(interval);
    };
  }, [navigate, touchSession, validateSession]);

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/admin/login" />;
  }

  return children;
}
