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
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email as EmailIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

// Reuse AuthCard from SimpleLoginForm (Theme-Aware)
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

interface PasswordResetRequestFormProps {
  onSwitchToLogin?: () => void;
}

export const PasswordResetRequestForm: React.FC<PasswordResetRequestFormProps> = ({
  onSwitchToLogin
}) => {
  const [email, setEmail] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { resetPassword, isLoading, error, clearError } = useAuth();

  // Clear errors on mount
  React.useEffect(() => {
    clearError();
    setHasAttemptedSubmit(false);
  }, [clearError]);

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
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(email);
    } catch (_error) {
      console.log('Password reset request failed:', error);
    }
  };

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
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </Typography>

        {error && hasAttemptedSubmit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {typeof error === 'string' ? error : 'Password reset request failed. Please try again.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <AuthTextField
            fullWidth
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors({});
              }
            }}
            error={!!validationErrors.email}
            helperText={validationErrors.email || 'Enter the email address for your account'}
            disabled={isLoading}
            required
            autoComplete="email"
            autoFocus
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
              'Send Reset Instructions'
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