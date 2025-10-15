import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Container,
  Link,
  useTheme
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme, selectTheme } from '@/store/slices/uiSlice';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const { user, isAuthenticated, logout } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Toolbar>
          {/* VTT Tools Branding */}
          <Typography
            id="app-logo"
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => navigate('/')}
          >
            VTT Tools
          </Typography>

          {/* Navigation Links (for authenticated users) */}
          {isAuthenticated && user && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              <Button
                id="nav-assets"
                color="inherit"
                onClick={() => navigate('/assets')}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Assets
              </Button>
              <Button
                id="nav-scene-editor"
                color="inherit"
                onClick={() => navigate('/scene-editor')}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Scene Editor
              </Button>
            </Box>
          )}

          {/* Spacer for non-authenticated users */}
          {(!isAuthenticated || !user) && <Box sx={{ flexGrow: 1 }} />}

          {/* Theme Toggle */}
          <IconButton
            id="btn-theme-toggle"
            color="inherit"
            onClick={handleThemeToggle}
            aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
            sx={{
              mr: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            {currentTheme === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>

          {/* Authentication Controls */}
          {isAuthenticated && user ? (
            // Logged in - show user menu
            <Box>
              <IconButton
                id="btn-user-menu"
                color="inherit"
                onClick={handleUserMenuOpen}
                aria-label="User menu"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem id="menu-profile" onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
                  Profile
                </MenuItem>
                <MenuItem id="menu-settings" onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                  Settings
                </MenuItem>
                <MenuItem id="menu-signout" onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Not logged in - show login/register buttons
            <Stack direction="row" spacing={1}>
              <Button
                id="btn-header-login"
                color="inherit"
                onClick={handleLogin}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                Login
              </Button>
              <Button
                id="btn-header-register"
                variant="contained"
                onClick={handleRegister}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  }
                }}
              >
                Register
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        id="app-footer"
        component="footer"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ fontSize: '0.875rem' }}
          >
            <Link id="footer-link-about" href="/about" color="inherit" underline="hover">
              About
            </Link>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>|</Box>
            <Link id="footer-link-contact" href="/contact" color="inherit" underline="hover">
              Contact
            </Link>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>|</Box>
            <Link id="footer-link-terms" href="/terms" color="inherit" underline="hover">
              Terms
            </Link>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>|</Box>
            <Link id="footer-link-privacy" href="/privacy" color="inherit" underline="hover">
              Privacy
            </Link>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>|</Box>
            <Typography id="footer-copyright" variant="inherit" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              © 2025 VTT Tools
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};