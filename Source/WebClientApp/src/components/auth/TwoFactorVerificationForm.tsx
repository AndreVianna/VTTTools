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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Security,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface TwoFactorVerificationFormProps {
  onSwitchToRecovery?: () => void;
  onBack?: () => void;
}

export const TwoFactorVerificationForm: React.FC<TwoFactorVerificationFormProps> = ({
  onSwitchToRecovery,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMachine, setRememberMachine] = useState(false);

  const { verifyTwoFactor, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    verificationCode?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { verificationCode?: string } = {};

    if (!verificationCode) {
      errors.verificationCode = 'Verification code is required';
    } else if (!/^\d{6}$/.test(verificationCode.replace(/\s/g, ''))) {
      errors.verificationCode = 'Verification code must be 6 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'TwoFactorVerificationForm',
        validationErrors
      });
      return;
    }

    try {
      await verifyTwoFactor(verificationCode.replace(/\s/g, ''), rememberMachine);
    } catch (_error) {
      // Error is already handled by the useAuth hook
      console.log('2FA verification failed:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        VTT Tools
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        Two-Factor Authentication
      </Typography>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Security sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Enter the 6-digit code from your authenticator app to complete sign in.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {renderAuthError(error)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          id="verificationCode"
          name="verificationCode"
          label="Verification Code"
          value={verificationCode}
          onChange={(e) => {
            // Format as XXX XXX for better readability
            const value = e.target.value.replace(/\s/g, '').replace(/(\d{3})(\d{3})/, '$1 $2');
            if (value.replace(/\s/g, '').length <= 6) {
              setVerificationCode(value);
              // Clear validation error when user starts typing
              if (validationErrors.verificationCode) {
                setValidationErrors(prev => ({ ...prev, verificationCode: undefined }));
              }
            }
          }}
          error={!!validationErrors.verificationCode}
          helperText={validationErrors.verificationCode}
          disabled={isLoading}
          margin="normal"
          required
          autoFocus
          autoComplete="one-time-code"
          inputProps={{
            style: {
              textAlign: 'center',
              fontSize: '1.5rem',
              letterSpacing: '0.5em',
              fontFamily: 'monospace'
            }
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMachine}
              onChange={(e) => setRememberMachine(e.target.checked)}
              disabled={isLoading}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              Remember this device for 30 days
            </Typography>
          }
          sx={{ mt: 2, mb: 1 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !verificationCode}
          sx={{ mt: 3, mb: 2, height: 48 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify Code'
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Having trouble with your authenticator app?
        </Typography>
        <Link
          component="button"
          variant="body2"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToRecovery?.();
          }}
          disabled={isLoading}
        >
          Use a recovery code instead
        </Link>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
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