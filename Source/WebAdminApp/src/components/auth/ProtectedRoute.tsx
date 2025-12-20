import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { checkAuth } from '@store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Always check auth on initial mount - cookies handle session persistence
    if (!isAuthenticated && !checkedRef.current) {
      checkedRef.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  // Show loading while:
  // 1. isLoading is true (auth check in progress)
  // 2. We haven't checked auth yet
  const isCheckingAuth = !isAuthenticated && !checkedRef.current;

  if (isLoading || isCheckingAuth) {
    return (
      <Box
        id="loading-admin-auth"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Validating session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.isAdmin) {
    return (
      <Box id="msg-admin-access-denied" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1">
          Administrator access required.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
