import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requiresRole?: boolean;
}

export default function ProtectedRoute({ children, requiresRole = true }: Props) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#172D46] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Not authenticated -> Redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but has NO role yet -> Redirect to /onboarding-role
  if (requiresRole && !user.activeRole) {
    return <Navigate to="/onboarding-role" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
