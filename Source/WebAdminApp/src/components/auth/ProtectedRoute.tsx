import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { setAuthenticated, logout } from '@store/slices/authSlice';
import { useGetCurrentUserQuery } from '@services/authApi';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    // Use RTK Query to check auth status - skip if already authenticated
    const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery(undefined, {
        skip: isAuthenticated,
    });

    // Sync RTK Query result with Redux state
    useEffect(() => {
        if (currentUser && !isAuthenticated) {
            dispatch(setAuthenticated({ user: currentUser }));
        } else if (isError && !isAuthenticated) {
            dispatch(logout());
        }
    }, [currentUser, isError, isAuthenticated, dispatch]);

    // Show loading while checking auth
    if (isLoading) {
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

    // Redirect to login if not authenticated
    if (!isAuthenticated && !currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check admin access
    const activeUser = user ?? currentUser;
    if (activeUser && !activeUser.isAdmin) {
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
