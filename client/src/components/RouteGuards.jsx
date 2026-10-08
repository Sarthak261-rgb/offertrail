import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { PageSpinner } from './ui.jsx';

/** Waits for the session check, so a refresh never flashes the login page. */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/**
 * Login and register pages. Once a user exists (including right after logging in),
 * send them back to the page they originally asked for.
 */
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />;
  return <Outlet />;
}
