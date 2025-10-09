import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  GitHub as GitHubIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface RegistrationFormProps {
  onSwitchToLogin?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: 'error' | 'warning' | 'info' | 'success';
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSwitchToLogin
}) => {
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    userName?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

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

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Username validation
    if (!formData.userName) {
      errors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      errors.userName = 'Username must be at least 3 characters';
    } else if (formData.userName.length > 50) {
      errors.userName = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.userName)) {
      errors.userName = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak. Missing: ' + passwordStrength.feedback.join(', ');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'RegistrationForm',
        validationErrors
      });
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.userName
      );
    } catch (_error) {
      // Error is already handled by the useAuth hook
      console.log('Registration failed:', error);
    }
  };

  const handleExternalLogin = (provider: string) => {
    window.location.href = `/api/auth/external-login?provider=${provider}&returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        VTT Tools
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        Create Account
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
          autoFocus
        />

        <TextField
          fullWidth
          id="userName"
          name="userName"
          label="Username"
          type="text"
          value={formData.userName}
          onChange={handleInputChange('userName')}
          error={!!validationErrors.userName}
          helperText={validationErrors.userName}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="username"
        />

        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange('password')}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="new-password"
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
        {formData.password && (
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

        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
          disabled={isLoading}
          margin="normal"
          required
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {formData.confirmPassword && (
                  formData.password === formData.confirmPassword ?
                    <CheckCircle color="success" sx={{ mr: 1 }} /> :
                    <Cancel color="error" sx={{ mr: 1 }} />
                )}
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.acceptTerms}
              onChange={handleInputChange('acceptTerms')}
              disabled={isLoading}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I accept the{' '}
              <Link href="/terms" target="_blank" rel="noopener">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" rel="noopener">
                Privacy Policy
              </Link>
            </Typography>
          }
          sx={{ mt: 2, mb: 1 }}
        />
        {validationErrors.acceptTerms && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
            {validationErrors.acceptTerms}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !formData.acceptTerms}
          sx={{ mt: 3, mb: 2, height: 48 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Account'
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Or sign up with
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => handleExternalLogin('Google')}
          disabled={isLoading}
        >
          Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MicrosoftIcon />}
          onClick={() => handleExternalLogin('Microsoft')}
          disabled={isLoading}
        >
          Microsoft
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={() => handleExternalLogin('GitHub')}
          disabled={isLoading}
        >
          GitHub
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin?.();
            }}
            disabled={isLoading}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};