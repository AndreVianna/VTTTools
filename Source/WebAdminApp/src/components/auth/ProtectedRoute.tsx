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
  const { isAuthenticated, isLoading, user, token } = useAppSelector((state) => state.auth);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !user && !checkedRef.current) {
      checkedRef.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, user]);

  /* eslint-disable react-hooks/refs */
  const isCheckingAuth = token && !isAuthenticated && !checkedRef.current;

  if (isLoading || isCheckingAuth) {
  /* eslint-enable react-hooks/refs */
    return (
      <Box
        id="loading-admin-auth"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
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
