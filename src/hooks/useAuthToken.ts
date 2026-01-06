import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Hook to get current access token
 * Updates when token changes
 */
export const useAccessToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = authService.getAccessToken();
    setToken(currentToken);

    // Listen for storage changes (if user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return token;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const token = useAccessToken();
  return !!token;
};
