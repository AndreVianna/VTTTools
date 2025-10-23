import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Container,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

const AuthCard = styled(Paper)(({ theme }) => ({
  maxWidth: '440px',
  margin: '0 auto',
  padding: '48px 40px',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 25px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.2)'
    : '0 20px 25px rgba(17, 24, 39, 0.1), 0 10px 10px rgba(17, 24, 39, 0.04)',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.08)'}`,
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.05) 100%), ${theme.palette.background.paper}`
    : `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.02) 100%), ${theme.palette.background.paper}`,
}));

const AuthTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    '& fieldset': {
      borderColor: theme.palette.divider,
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
      boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)'}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    color: theme.palette.text.primary,
  },
  '& .MuiFormHelperText-root': {
    color: theme.palette.text.secondary,
  },
}));

const AuthSubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 24px',
  fontSize: '0.975rem',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
    },
  },
}));

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
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  const { confirmResetPassword, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
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

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.token) {
      errors.token = 'Reset token is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordStrength.score < 3) {
      errors.newPassword = 'Password is too weak. Missing: ' + passwordStrength.feedback.join(', ');
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
        formData.confirmPassword
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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <AuthCard>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 600,
            textAlign: 'center',
            mb: 1,
          }}
        >
          Reset Password
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: '0.975rem',
            color: theme => theme.palette.text.secondary,
            textAlign: 'center',
            mb: 4,
          }}
        >
          Enter your new password below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {renderAuthError(error)}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AuthTextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            disabled={true}
            helperText="Resetting password for this account"
            required
            autoComplete="email"
            sx={{ mb: 3 }}
          />

          <AuthTextField
            fullWidth
            id="newPassword"
            name="newPassword"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            error={!!validationErrors.newPassword}
            helperText={validationErrors.newPassword || ''}
            disabled={isLoading}
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
            sx={{ mb: 1 }}
          />

          {formData.newPassword && (
            <Box sx={{ mb: 3 }}>
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

          <AuthTextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword || 'Re-enter your password to confirm'}
            disabled={isLoading}
            required
            autoComplete="new-password"
            sx={{ mb: 4 }}
          />

          <AuthSubmitButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mb: 3 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Reset Password'
            )}
          </AuthSubmitButton>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin?.();
              }}
              disabled={isLoading}
              sx={{
                color: theme => theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Back to login
            </Link>
          </Typography>
        </Box>
      </AuthCard>
    </Container>
  );
};