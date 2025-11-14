import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingOverlay } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Authorization level required for this route
   * - 'anonymous': Public route, no authentication required
   * - 'authorized': Requires user to be logged in
   *
   * Future: Can be extended to support role-based access ('admin', 'editor', etc.)
   */
  authLevel?: 'anonymous' | 'authorized';

  /**
   * Optional redirect path if authorization fails
   * Defaults to '/login' for authorized routes
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute - Route wrapper that enforces authentication and authorization
 *
 * Features:
 * - Checks user authentication status
 * - Redirects to login if unauthorized
 * - Preserves intended destination for post-login redirect
 * - Shows loading state during auth check
 *
 * Usage:
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute authLevel="authorized">
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  authLevel = 'authorized',
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Show loading overlay during initial auth check
  if (isInitializing) {
    return <LoadingOverlay open={true} message='Checking authorization...' />;
  }

  // Anonymous routes - always allow access
  if (authLevel === 'anonymous') {
    return <>{children}</>;
  }

  // Authorized routes - require authentication
  if (authLevel === 'authorized') {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`${redirectTo}?returnUrl=${returnUrl}`} state={{ from: location }} replace />;
    }

    return <>{children}</>;
  }

  // Default: deny access if auth level not recognized
  return <Navigate to={redirectTo} replace />;
};
