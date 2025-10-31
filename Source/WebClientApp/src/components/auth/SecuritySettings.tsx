import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Security,
  Key,
  Password,
  Close,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { TwoFactorSetupForm } from './TwoFactorSetupForm';
import { RecoveryCodesManager } from './RecoveryCodesManager';
import { handleValidationError } from '@/utils/errorHandling';
import { renderAuthError } from '@/utils/renderError';
import { useResetPasswordMutation } from '@/services/authApi';
import { useDisableTwoFactorMutation } from '@/api/twoFactorApi';

export const SecuritySettings: React.FC = () => {
  const { user, error } = useAuth();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [disableTwoFactor, { isLoading: isDisabling2FA }] = useDisableTwoFactorMutation();

  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showRecoveryManager, setShowRecoveryManager] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  const [disablePassword, setDisablePassword] = useState('');

  const [validationErrors, setValidationErrors] = useState<{
    disablePassword?: string;
  }>({});

  const handleResetPassword = async () => {
    if (!user?.email) {
      return;
    }

    try {
      await resetPassword({ email: user.email }).unwrap();
      setResetPasswordSuccess(true);
      setTimeout(() => setResetPasswordSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  };

  const validateDisablePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!disablePassword) {
      errors.disablePassword = 'Password is required to disable 2FA';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDisableTwoFactor = async () => {
    if (!validateDisablePassword()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'SecuritySettings',
        validationErrors
      });
      return;
    }

    try {
      const result = await disableTwoFactor({
        password: disablePassword,
      }).unwrap();

      if (result.success) {
        setShowDisable2FA(false);
        setDisablePassword('');
        setValidationErrors({});
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    }
  };

  const resetDisableForm = () => {
    setDisablePassword('');
    setValidationErrors({});
    setShowDisable2FA(false);
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Security Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {renderAuthError(error)}
          </Alert>
        )}

        {resetPasswordSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset email sent to {user.email}. Please check your inbox.
          </Alert>
        )}

        <List>
          {/* Password Management */}
          <ListItem>
            <ListItemIcon>
              <Password />
            </ListItemIcon>
            <ListItemText
              primary="Password"
              secondary="Reset your account password via email"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? <CircularProgress size={20} /> : 'Reset Password'}
              </Button>
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          {/* Two-Factor Authentication */}
          <ListItem>
            <ListItemIcon>
              <Security color={user.twoFactorEnabled ? 'success' : 'action'} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Two-Factor Authentication
                  {user.twoFactorEnabled ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                </Box>
              }
              secondary={
                user.twoFactorEnabled
                  ? 'Your account is protected with two-factor authentication'
                  : 'Add an extra layer of security to your account'
              }
            />
            <ListItemSecondaryAction>
              {user.twoFactorEnabled ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowDisable2FA(true)}
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setShowTwoFactorSetup(true)}
                >
                  Enable 2FA
                </Button>
              )}
            </ListItemSecondaryAction>
          </ListItem>

          {/* Recovery Codes */}
          {user.twoFactorEnabled && (
            <>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Key />
                </ListItemIcon>
                <ListItemText
                  primary="Recovery Codes"
                  secondary="Manage your backup recovery codes"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    onClick={() => setShowRecoveryManager(true)}
                  >
                    Manage Codes
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}
        </List>
      </Paper>

      {/* 2FA Setup Dialog */}
      <Dialog
        open={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <TwoFactorSetupForm
            onComplete={() => setShowTwoFactorSetup(false)}
            onCancel={() => setShowTwoFactorSetup(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Recovery Codes Manager Dialog */}
      <Dialog
        open={showRecoveryManager}
        onClose={() => setShowRecoveryManager(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <RecoveryCodesManager
            onClose={() => setShowRecoveryManager(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog
        open={showDisable2FA}
        onClose={resetDisableForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Disable Two-Factor Authentication
            <IconButton onClick={resetDisableForm}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Disabling two-factor authentication will make your account less secure.
              Are you sure you want to continue?
            </Typography>
          </Alert>

          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            error={!!validationErrors.disablePassword}
            helperText={validationErrors.disablePassword || 'Enter your password to confirm'}
            margin="normal"
            autoComplete="current-password"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDisableForm}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDisableTwoFactor}
            disabled={isDisabling2FA}
          >
            {isDisabling2FA ? <CircularProgress size={20} /> : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};