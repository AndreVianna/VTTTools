import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  AccountCircle,
  ArrowBack as ArrowBackIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme, selectTheme } from '@/store/slices/uiSlice';
import { ConnectionStatusBanner, EditableSceneName, SaveStatusIndicator, SaveStatus } from '@/components/common';
import { ScenePropertiesPanel } from '@/components/scene';
import type { Scene } from '@/types/domain';

interface EditorLayoutProps {
  children: React.ReactNode;
  scene?: Scene;
  onSceneNameChange?: (name: string) => void;
  onSceneNameBlur?: (name: string) => void;
  onBackClick?: () => void;
  saveStatus?: SaveStatus;
  onSceneDescriptionChange?: (description: string) => void;
  onScenePublishedChange?: (published: boolean) => void;
  onBackgroundUpload?: (file: File) => void;
  onGridChange?: (grid: import('@/utils/gridCalculator').GridConfig) => void;
  backgroundUrl?: string;
  isUploadingBackground?: boolean;
  onSceneUpdate?: (updates: Partial<Scene>) => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  scene,
  onSceneNameChange,
  onSceneNameBlur,
  onBackClick,
  saveStatus,
  onSceneDescriptionChange,
  onScenePublishedChange,
  onBackgroundUpload,
  onGridChange,
  backgroundUrl,
  isUploadingBackground,
  onSceneUpdate
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const { user, logout } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = React.useState(false);

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
    await logout();
    handleUserMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar
        component="header"
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          flexShrink: 0
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {scene && onBackClick && (
            <IconButton
              color="inherit"
              onClick={onBackClick}
              aria-label="Back"
              sx={{
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {scene && (
            <IconButton
              color="inherit"
              onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
              aria-label="Toggle properties panel"
              sx={{
                mr: 2,
                backgroundColor: propertiesPanelOpen
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <TuneIcon />
            </IconButton>
          )}

          {scene && onSceneNameChange ? (
            <EditableSceneName
              value={scene.name}
              onChange={onSceneNameChange}
              onBlur={onSceneNameBlur}
              disabled={!scene}
            />
          ) : (
            <Typography
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
          )}

          <Box sx={{ flexGrow: 1 }} />

          {saveStatus && (
            <SaveStatusIndicator status={saveStatus} compact />
          )}

          <ConnectionStatusBanner />

          <IconButton
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

          {user && (
            <>
              <IconButton
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
                <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {scene && (
        <ScenePropertiesPanel
          open={propertiesPanelOpen}
          scene={scene}
          onDescriptionChange={onSceneDescriptionChange ?? (() => {})}
          onPublishedChange={onScenePublishedChange ?? (() => {})}
          onBackgroundUpload={onBackgroundUpload}
          onGridChange={onGridChange}
          backgroundUrl={backgroundUrl}
          isUploadingBackground={isUploadingBackground}
          onSceneUpdate={onSceneUpdate}
        />
      )}

      <Box component="main" sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </Box>
    </Box>
  );
};
