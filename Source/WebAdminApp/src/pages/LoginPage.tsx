import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setAuthenticated, setAuthError, clearError } from '@store/slices/authSlice';
import { toggleTheme, selectTheme } from '@store/slices/uiSlice';
import { useLoginMutation, useLazyGetCurrentUserQuery } from '@services/authApi';
import type { LoginRequest } from '../types/auth';

interface LocationState {
    from?: { pathname: string };
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { error } = useAppSelector((state) => state.auth);
    const currentTheme = useAppSelector(selectTheme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [getCurrentUser, { isLoading: isUserLoading }] = useLazyGetCurrentUserQuery();

    const isLoading = isLoginLoading || isUserLoading;

    const state = location.state as LocationState | null;
    const from = state?.from?.pathname ?? '/admin/dashboard';

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    const validatePassword = (password: string): boolean => {
        if (password.length < 12) {
            setPasswordError('Password must be at least 12 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());

        if (!validatePassword(password)) {
            return;
        }

        const loginData: LoginRequest = {
            email,
            password,
        };

        if (requiresTwoFactor && twoFactorCode) {
            loginData.twoFactorCode = twoFactorCode;
        }

        try {
            const result = await login(loginData).unwrap();

            if (result.success) {
                // If user is in the response, use it directly
                if (result.user) {
                    dispatch(setAuthenticated({ user: result.user }));
                    navigate(from, { replace: true });
                } else {
                    // Otherwise fetch the user
                    const userResult = await getCurrentUser().unwrap();
                    dispatch(setAuthenticated({ user: userResult }));
                    navigate(from, { replace: true });
                }
            } else if (result.requiresTwoFactor) {
                setRequiresTwoFactor(true);
            } else {
                dispatch(setAuthError(result.error || 'Login failed'));
            }
        } catch (err) {
            const errorMessage = (err as { data?: { message?: string }; error?: string })?.data?.message ||
                (err as { error?: string })?.error ||
                'Login failed';

            if (errorMessage.includes('two-factor')) {
                setRequiresTwoFactor(true);
            } else {
                dispatch(setAuthError(errorMessage));
            }
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: 'primary.main' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        VTT Tools - Administration
                    </Typography>
                    <IconButton
                        id="btn-theme-toggle"
                        color="inherit"
                        onClick={handleThemeToggle}
                        aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    pt: 8,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        maxWidth: 400,
                        width: '100%',
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Admin Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        VTT Tools Administration
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="input-admin-email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="input-admin-password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (e.target.value) {
                                    validatePassword(e.target.value);
                                } else {
                                    setPasswordError('');
                                }
                            }}
                            disabled={isLoading}
                            error={!!passwordError}
                            helperText={passwordError}
                        />

                        {requiresTwoFactor && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="twoFactorCode"
                                label="Two-Factor Code"
                                id="input-admin-2fa"
                                autoComplete="one-time-code"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                disabled={isLoading}
                                helperText="Enter the 6-digit code from your authenticator app"
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            id="btn-admin-login"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </>
    );
}
