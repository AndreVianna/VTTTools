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
} from '@mui/material';
import {
  Key,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';

interface RecoveryCodeFormProps {
  onSwitchToTwoFactor?: () => void;
  onBack?: () => void;
}

export const RecoveryCodeForm: React.FC<RecoveryCodeFormProps> = ({
  onSwitchToTwoFactor,
  onBack
}) => {
  const [recoveryCode, setRecoveryCode] = useState('');

  const { verifyRecoveryCode, isLoading, error } = useAuth();

  const [validationErrors, setValidationErrors] = useState<{
    recoveryCode?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { recoveryCode?: string } = {};

    if (!recoveryCode) {
      errors.recoveryCode = 'Recovery code is required';
    } else if (!/^[a-zA-Z0-9-]{8,}$/.test(recoveryCode.replace(/\s/g, ''))) {
      errors.recoveryCode = 'Invalid recovery code format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'RecoveryCodeForm',
        validationErrors
      });
      return;
    }

    try {
      await verifyRecoveryCode(recoveryCode.replace(/\s/g, ''));
    } catch (_error) {
      // Error is already handled by the useAuth hook
      console.error('Recovery code verification failed:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        VTT Tools
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
        Recovery Code
      </Typography>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Key sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Enter one of your saved recovery codes to complete sign in.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {renderAuthError(error)}
        </Alert>
      )}

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Each recovery code can only be used once. After using this code, it will be invalidated.
        </Typography>
      </Alert>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          id="recoveryCode"
          name="recoveryCode"
          label="Recovery Code"
          value={recoveryCode}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setRecoveryCode(value);
            // Clear validation error when user starts typing
            if (validationErrors.recoveryCode) {
              setValidationErrors({});
            }
          }}
          error={!!validationErrors.recoveryCode}
          helperText={validationErrors.recoveryCode || 'Enter the recovery code exactly as shown when you saved it'}
          disabled={isLoading}
          margin="normal"
          required
          autoFocus
          autoComplete="one-time-code"
          placeholder="XXXXXXXX"
          inputProps={{
            style: {
              textAlign: 'center',
              fontSize: '1.2rem',
              letterSpacing: '0.2em',
              fontFamily: 'monospace'
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !recoveryCode}
          sx={{ mt: 3, mb: 2, height: 48 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify Recovery Code'
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Found your authenticator app?
        </Typography>
        <Link
          component="button"
          variant="body2"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToTwoFactor?.();
          }}
          disabled={isLoading}
        >
          Use authenticator code instead
        </Link>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
          }}
          disabled={isLoading}
          startIcon={<ArrowBack />}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};