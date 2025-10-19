import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person,
  Security,
  Login as LoginIcon,
  PersonAdd,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from './LogoutButton';

interface AuthStatusProps {
  onNavigateToProfile?: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
  showFullControls?: boolean;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  onNavigateToProfile,
  onNavigateToSecurity,
  onNavigateToLogin,
  onNavigateToRegister,
  showFullControls = true
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          <Person />
        </Avatar>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showFullControls ? (
          <>
            <IconButton
              color="primary"
              onClick={onNavigateToLogin}
              title="Sign In"
            >
              <LoginIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={onNavigateToRegister}
              title="Sign Up"
            >
              <PersonAdd />
            </IconButton>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not signed in
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* User Avatar and Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: showFullControls ? 'pointer' : 'default',
          p: 1,
          borderRadius: 1,
          '&:hover': showFullControls ? {
            backgroundColor: 'action.hover'
          } : {}
        }}
        onClick={showFullControls ? handleMenuOpen : undefined}
      >
        <Avatar
          {...(user.profilePictureUrl ? { src: user.profilePictureUrl } : {})}
          alt={user.email}
          sx={{ width: 32, height: 32 }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" fontWeight="medium">
            {user.displayName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
            {user.emailConfirmed && (
              <CheckCircle sx={{ fontSize: 12, color: 'success.main' }} />
            )}
          </Box>
        </Box>

        {/* Security Status Indicators */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
          {user.twoFactorEnabled && (
            <Chip
              icon={<Security />}
              label="2FA"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          {!user.emailConfirmed && (
            <Chip
              icon={<Warning />}
              label="Verify Email"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* User Menu */}
      {showFullControls && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 24,
                height: 24,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info Header */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              {user.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <Divider />

          {/* Profile Menu Items */}
          <MenuItem onClick={onNavigateToProfile}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText>Profile Settings</ListItemText>
          </MenuItem>

          <MenuItem onClick={onNavigateToSecurity}>
            <ListItemIcon>
              <Security />
            </ListItemIcon>
            <ListItemText>Security & Privacy</ListItemText>
          </MenuItem>

          <Divider />

          {/* Logout */}
          <MenuItem component="div" sx={{ p: 1 }}>
            <LogoutButton
              variant="text"
              size="small"
              showConfirmation={true}
              onLogoutComplete={handleMenuClose}
            />
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};