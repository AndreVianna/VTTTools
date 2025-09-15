import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface PasswordResetRequestFormProps {
  onSwitchToLogin?: () => void;
}

export const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({
  onSwitchToLogin
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'PasswordResetRequestForm',
        validationErrors
      });
      return;
    }

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.log('Password reset request failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          VTT Tools
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Check Your Email
        </Typography>

        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            mt: 3,
            backgroundColor: 'success.light',
            color: 'success.contrastText',
          }}
        >
          <EmailIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Password reset instructions have been sent to:
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please check your email and follow the instructions to reset your password.
            The link will expire in 24 hours.
          </Typography>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Didn't receive the email?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                setIsSubmitted(false);
              }}
              disabled={isLoading}
            >
              Try again
            </Link>
          </Typography>
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
        Enter your email address and we'll send you instructions to reset your password.
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
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Clear validation error when user starts typing
            if (validationErrors.email) {
              setValidationErrors(prev => ({ ...prev, email: undefined }));
            }
          }}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="email"
          autoFocus
          InputProps={{
            startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />

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
            'Send Reset Instructions'
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