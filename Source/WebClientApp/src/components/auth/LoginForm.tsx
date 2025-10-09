import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToResetPassword?: () => void;
  onLoginResult?: (result: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToResetPassword,
  onLoginResult
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, canRetryLogin, getLockoutTimeRemaining } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'LoginForm',
        validationErrors
      });
      return;
    }

    if (!canRetryLogin()) {
      const timeRemaining = getLockoutTimeRemaining();
      const minutes = Math.ceil(timeRemaining / 60000);
      handleValidationError(new Error(`Too many login attempts. Please try again in ${minutes} minutes.`), {
        component: 'LoginForm',
        operation: 'rateLimited'
      });
      return;
    }

    try {
      const result = await login(email, password, rememberMe);
      // Notify parent component of login result
      if (onLoginResult) {
        onLoginResult(result);
      }
    } catch (_error) {
      // Error is already handled by the useAuth hook
      console.log('Login failed:', error);
    }
  };

  const handleExternalLogin = (provider: string) => {
    // This would redirect to the external login URL from the API
    window.location.href = `/api/auth/external-login?provider=${provider}&returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  const lockoutTime = getLockoutTimeRemaining();
  const isLockedOut = !canRetryLogin() && lockoutTime > 0;

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          VTT Tools
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {renderAuthError(error)}
            {isLockedOut && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Account temporarily locked. Try again in {Math.ceil(lockoutTime / 60000)} minutes.
              </Typography>
            )}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            disabled={isLoading || isLockedOut}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            disabled={isLoading || isLockedOut}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isLoading || isLockedOut}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading || isLockedOut}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Remember me for 30 days
              </Typography>
            }
            sx={{ mt: 1, mb: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || isLockedOut}
            sx={{ mt: 3, mb: 2, height: 48 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToResetPassword?.();
            }}
            disabled={isLoading}
          >
            Forgot your password?
          </Link>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Or continue with
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleExternalLogin('Google')}
            disabled={isLoading || isLockedOut}
          >
            Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MicrosoftIcon />}
            onClick={() => handleExternalLogin('Microsoft')}
            disabled={isLoading || isLockedOut}
          >
            Microsoft
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleExternalLogin('GitHub')}
            disabled={isLoading || isLockedOut}
          >
            GitHub
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister?.();
              }}
              disabled={isLoading}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};