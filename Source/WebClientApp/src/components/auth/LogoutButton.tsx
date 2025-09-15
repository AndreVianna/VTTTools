import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Close,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showConfirmation?: boolean;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outlined',
  size = 'medium',
  showIcon = true,
  showConfirmation = true,
  onLogoutStart,
  onLogoutComplete
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { logout, isLoading } = useAuth();

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowConfirmDialog(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      onLogoutStart?.();
      await logout();
      onLogoutComplete?.();
    } catch (error) {
      console.error('Logout failed:', error);
      // The useAuth hook handles error notifications
    } finally {
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={showIcon ? <LogoutIcon /> : undefined}
        onClick={handleLogoutClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={16} />
        ) : (
          'Logout'
        )}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Confirm Logout
            <IconButton onClick={() => setShowConfirmDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: 'warning.main', mr: 2 }} />
            <Typography variant="h6">
              Are you sure you want to log out?
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            You will need to sign in again to access your account.
            Any unsaved changes may be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleLogout}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <LogoutIcon />}
          >
            {isLoading ? 'Logging Out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};