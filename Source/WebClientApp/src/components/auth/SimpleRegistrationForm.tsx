import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/useAuth';

// Authentication Card Container - Professional Design (Theme-Aware)
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

  // Subtle background pattern
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.05) 100%), ${theme.palette.background.paper}`
    : `linear-gradient(135deg, transparent 0%, rgba(37, 99, 235, 0.02) 100%), ${theme.palette.background.paper}`,
}));

// Enhanced Form Field Styling (Theme-Aware)
const AuthTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    // Subtle background that works on both dark and light card backgrounds
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'  // Slight white tint in dark mode
      : 'rgba(0, 0, 0, 0.02)',        // Slight gray tint in light mode
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
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(220, 38, 38, 0.1)'    // Dark red tint for dark mode
      : '#FEF2F2',                   // Light red for light mode
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

interface SimpleRegistrationFormProps {
  onSwitchToLogin?: () => void;
}

export const SimpleRegistrationForm: React.FC<SimpleRegistrationFormProps> = ({
  onSwitchToLogin
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',  // This is DisplayName (user's friendly name)
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading, error, clearError } = useAuth();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Clear any persisted auth errors when component mounts
  React.useEffect(() => {
    clearError();
    setHasAttemptedSubmit(false);
  }, [clearError]);

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    name?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Display name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 1) {
      errors.name = 'Name must be at least 1 character';
    } else if (formData.name.length > 32) {
      errors.name = 'Name cannot exceed 32 characters';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    console.log('Registration form submitted', formData);
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      console.log('Form validation failed', validationErrors);
      return;
    }

    console.log('Form validation passed, calling register...');

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.password,  // confirmPassword = password (backend still requires it)
        formData.name  // Send name as displayName
      );
      console.log('Registration result:', result);
    } catch (error: any) {
      // Log detailed error information
      console.error('Registration failed - Full error:', error);
      console.error('Error status:', error?.status);
      console.error('Error data:', error?.data);
      console.error('Error message:', error?.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <AuthCard>
        <div className="auth-header">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: theme => theme.palette.text.primary,
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            Start Your Journey
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '0.975rem',
              color: theme => theme.palette.text.secondary,
              lineHeight: 1.5,
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            Join thousands of Game Masters creating epic adventures
          </Typography>
        </div>

        {error && hasAttemptedSubmit && (
          <VTTAlert severity="error" sx={{ mb: 3 }}>
            {typeof error === 'string' ? error : error?.message || 'Registration failed. Please try again.'}
          </VTTAlert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="auth-form">
          <AuthTextField
            fullWidth
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!validationErrors.email}
            helperText={validationErrors.email || 'Please enter a valid email address'}
            disabled={isLoading}
            required
            autoComplete="email"
            autoFocus
            sx={{ mb: 3 }}
          />

          <AuthTextField
            fullWidth
            id="name"
            label="Name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!validationErrors.name}
            helperText={validationErrors.name || 'Your display name (e.g., John Smith)'}
            disabled={isLoading}
            required
            autoComplete="name"
            sx={{ mb: 3 }}
          />

          <AuthTextField
            fullWidth
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!validationErrors.password}
            helperText={validationErrors.password || 'Password must be at least 6 characters'}
            disabled={isLoading}
            required
            autoComplete="new-password"
            sx={{ mb: 4 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
              'Create My Account'
            )}
          </AuthSubmitButton>
        </Box>

        <div className="auth-footer">
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: theme => theme.palette.text.secondary,
              textAlign: 'center',
            }}
          >
            Already have an account?{' '}
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
              Sign in here
            </Link>
          </Typography>
        </div>
      </AuthCard>
    </Container>
  );
};