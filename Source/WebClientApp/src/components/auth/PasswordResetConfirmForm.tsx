import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface PasswordResetConfirmFormProps {
  onSwitchToLogin?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: 'error' | 'warning' | 'info' | 'success';
}

export const PasswordResetConfirmForm: React.FC<PasswordResetConfirmFormProps> = ({
  onSwitchToLogin
}) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  const { confirmResetPassword, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    token?: string;
    newPassword?: string;
  }>({});

  // Extract email and token from URL params
  useEffect(() => {
    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';

    if (!email || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInvalidToken(true);
    } else {
      setFormData(prev => ({ ...prev, email, token }));
    }
    // Note: Intentionally syncing external state (URL params) with component state
    // This is a legitimate use case for setState in useEffect
  }, [searchParams]);

  // Password strength checker
  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Special character');
    }

    let color: 'error' | 'warning' | 'info' | 'success';
    if (score < 2) color = 'error';
    else if (score < 3) color = 'warning';
    else if (score < 4) color = 'info';
    else color = 'success';

    return { score, feedback, color };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Token validation
    if (!formData.token) {
      errors.token = 'Reset token is required';
    }

    // Password validation
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordStrength.score < 3) {
      errors.newPassword = 'Password is too weak. Missing: ' + passwordStrength.feedback.join(', ');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'PasswordResetConfirmForm',
        validationErrors
      });
      return;
    }

    try {
      await confirmResetPassword(
        formData.email,
        formData.token,
        formData.newPassword,
        formData.newPassword  // Send password twice (backend still requires confirmPassword)
      );
    } catch (_error) {
      // Error is already handled by the useAuth hook
      console.log('Password reset confirmation failed:', error);
    }
  };

  if (isInvalidToken) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          VTT Tools
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Invalid Reset Link
        </Typography>

        <Alert severity="error" sx={{ mb: 2 }}>
          The password reset link is invalid or has expired. Please request a new password reset.
        </Alert>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={onSwitchToLogin}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        VTT Tools
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        Reset Password
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your new password below.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {renderAuthError(error)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="email"
        />

        <TextField
          fullWidth
          id="newPassword"
          name="newPassword"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleInputChange('newPassword')}
          error={!!validationErrors.newPassword}
          helperText={validationErrors.newPassword}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="new-password"
          autoFocus
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={isLoading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Password Strength:
              </Typography>
              <Box sx={{ ml: 1, flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 5) * 100}
                  color={passwordStrength.color}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Box>
            {passwordStrength.feedback.length > 0 && (
              <Typography variant="caption" color={passwordStrength.color}>
                Missing: {passwordStrength.feedback.join(', ')}
              </Typography>
            )}
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 3, mb: 2, height: 48 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Reset Password'
          )}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToLogin?.();
          }}
          disabled={isLoading}
          startIcon={<ArrowBack />}
        >
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};