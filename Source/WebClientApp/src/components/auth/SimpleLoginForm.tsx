import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Authentication Card Container - Professional Design (Theme-Aware)
const AuthCard = styled(Paper)(({ theme }) => ({
  maxWidth: '440px',
  margin: '0 auto',
  padding: '48px 40px',
  borderRadius: '16px',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 20px 25px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.2)'
      : '0 20px 25px rgba(17, 24, 39, 0.1), 0 10px 10px rgba(17, 24, 39, 0.04)',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.08)'}`,

  // Subtle background pattern
  background:
    theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.05) 100%), ${theme.palette.background.paper}`
      : `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.02) 100%), ${theme.palette.background.paper}`,
}));

// Enhanced Form Field Styling (Theme-Aware)
const AuthTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    // Subtle background that works on both dark and light card backgrounds
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)' // Slight white tint in dark mode
        : 'rgba(0, 0, 0, 0.02)', // Slight gray tint in light mode
    transition: 'all 0.2s ease-in-out',

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

    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
      boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.1)'}`,
    },
  },

  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,

    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },

  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: '0.975rem',
    color: theme.palette.text.primary,
  },

  '& .MuiFormHelperText-root': {
    color: theme.palette.text.secondary,
  },
}));

// Professional Submit Button
const AuthSubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 24px',
  fontSize: '0.975rem',
  fontWeight: 500,
  textTransform: 'none',
  letterSpacing: '0.025em',
  boxShadow: 'none',

  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,

    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
    },

    '&:active': {
      transform: 'translateY(0)',
    },

    '&:disabled': {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  },
}));

// Professional Alert Component (Theme-Aware)
const VTTAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: '12px',
  padding: '12px 16px',
  border: 'none',

  // Error state with theme support
  ...(severity === 'error' && {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(220, 38, 38, 0.1)' // Dark red tint for dark mode
        : '#FEF2F2', // Light red for light mode
    color: theme.palette.error.main,

    '& .MuiAlert-icon': {
      color: theme.palette.error.main,
    },
  }),

  '& .MuiAlert-message': {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
}));

interface SimpleLoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToResetPassword?: () => void;
}

export const SimpleLoginForm: React.FC<SimpleLoginFormProps> = ({ onSwitchToRegister, onSwitchToResetPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();

  // Clear any persisted auth errors when component mounts
  React.useEffect(() => {
    clearError();
    setHasAttemptedSubmit(false);
  }, [clearError]);

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [clientValidationError, setClientValidationError] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = errors.email || errors.password || '';
      setClientValidationError(firstError);
      return false;
    }

    setClientValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password, rememberMe);
    } catch (_error) {
      setPassword('');
      console.error('Login failed:', error);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <AuthCard>
        <div className='auth-header'>
          <Typography
            variant='h2'
            component='h1'
            sx={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary,
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            Welcome Back, Game Master
          </Typography>
          <Typography
            variant='body1'
            sx={{
              fontSize: '0.975rem',
              color: (theme) => theme.palette.text.secondary,
              lineHeight: 1.5,
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            Sign in to continue crafting your adventures
          </Typography>
        </div>

        {(error && hasAttemptedSubmit) || clientValidationError ? (
          <VTTAlert severity='error' sx={{ mb: 3 }} role='alert'>
            {clientValidationError || (typeof error === 'string' ? error : 'Login failed. Please try again.')}
          </VTTAlert>
        ) : null}

        <Box component='form' onSubmit={handleSubmit} noValidate className='auth-form'>
          <AuthTextField
            fullWidth
            id='email'
            label='Email Address'
            type='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientValidationError) setClientValidationError('');
              if (validationErrors.email) setValidationErrors({});
            }}
            error={!!validationErrors.email}
            helperText={validationErrors.email || 'Enter your registered email address'}
            disabled={isLoading}
            required
            autoComplete='email'
            autoFocus
            sx={{ mb: 3 }}
          />

          <AuthTextField
            fullWidth
            id='password'
            label='Password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (clientValidationError) setClientValidationError('');
              if (validationErrors.password) setValidationErrors({});
            }}
            error={!!validationErrors.password}
            helperText={validationErrors.password || 'Password must be at least 8 characters'}
            disabled={isLoading}
            required
            autoComplete='current-password'
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge='end'
                    size='small'
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me and Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  size='small'
                />
              }
              label={
                <Typography variant='body2' color='text.secondary'>
                  Remember me for 30 days
                </Typography>
              }
            />
            {onSwitchToResetPassword && (
              <Link
                component='button'
                variant='body2'
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToResetPassword();
                }}
                disabled={isLoading}
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            )}
          </Box>

          <AuthSubmitButton type='submit' fullWidth variant='contained' disabled={isLoading} sx={{ mb: 3 }}>
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Sign In to VTT Tools'}
          </AuthSubmitButton>
        </Box>

        <div className='auth-footer'>
          <Typography
            variant='body2'
            sx={{
              fontSize: '0.875rem',
              color: (theme) => theme.palette.text.secondary,
              textAlign: 'center',
            }}
          >
            New to VTT Tools?{' '}
            <Link
              component='button'
              variant='body2'
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister?.();
              }}
              disabled={isLoading}
              sx={{
                color: (theme) => theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Create your account
            </Link>
          </Typography>
        </div>
      </AuthCard>
    </Container>
  );
};
