import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, getUserRole } from '../types';

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export const useRequireAuth = (allowedRoles?: UserRole[]) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        navigate('/login', { replace: true });
      } else if (allowedRoles && user && !allowedRoles.includes(getUserRole(user))) {
        // Authenticated but doesn't have required role
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate]);

  return { isAuthenticated, user, loading };
};
