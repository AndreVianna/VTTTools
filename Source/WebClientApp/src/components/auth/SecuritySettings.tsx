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

export const SecuritySettings: React.FC = () => {
  const { user, changePassword, disableTwoFactor, isLoading, error } = useAuth();

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showRecoveryManager, setShowRecoveryManager] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [disablePassword, setDisablePassword] = useState('');

  const [validationErrors, setValidationErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    disablePassword?: string;
  }>({});

  // Password strength checker
  const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Number');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Special character');

    return { score, feedback };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const validatePasswordChange = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordStrength.score < 3) {
      errors.newPassword = 'Password is too weak. Missing: ' + passwordStrength.feedback.join(', ');
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDisablePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!disablePassword) {
      errors.disablePassword = 'Password is required to disable 2FA';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordChange()) {
      handleValidationError(new Error('Form validation failed'), {
        component: 'SecuritySettings',
        validationErrors
      });
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setValidationErrors({});
    } catch (_error) {
      console.error('Failed to change password:', error);
    }
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
      await disableTwoFactor(disablePassword);
      setShowDisable2FA(false);
      setDisablePassword('');
      setValidationErrors({});
    } catch (_error) {
      console.error('Failed to disable 2FA:', error);
    }
  };

  const resetPasswordForm = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setValidationErrors({});
    setShowPasswordChange(false);
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

        <List>
          {/* Password Management */}
          <ListItem>
            <ListItemIcon>
              <Password />
            </ListItemIcon>
            <ListItemText
              primary="Password"
              secondary="Change your account password"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
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

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordChange}
        onClose={resetPasswordForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Change Password
            <IconButton onClick={resetPasswordForm}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            error={!!validationErrors.currentPassword}
            helperText={validationErrors.currentPassword || ''}
            margin="normal"
            autoComplete="current-password"
          />

          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            error={!!validationErrors.newPassword}
            helperText={validationErrors.newPassword || ''}
            margin="normal"
            autoComplete="new-password"
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword || ''}
            margin="normal"
            autoComplete="new-password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetPasswordForm}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

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
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};