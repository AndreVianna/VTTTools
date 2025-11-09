import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme, selectTheme } from '@/store/slices/uiSlice';
import { ScenePropertiesDrawer } from '@/components/scene';
import type { Scene, Light, Weather } from '@/types/domain';

interface EditorLayoutProps {
  children: React.ReactNode;
  scene?: Scene | undefined;
  onSceneNameChange?: (name: string) => void;
  onBackClick?: () => void;
  onSceneDescriptionChange?: (description: string) => void;
  onScenePublishedChange?: (published: boolean) => void;
  onSceneUpdate?: (updates: Partial<Scene>) => void;
  backgroundUrl?: string;
  isUploadingBackground?: boolean;
  onBackgroundUpload?: (file: File) => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  scene,
  onSceneNameChange,
  onBackClick,
  onSceneDescriptionChange,
  onScenePublishedChange,
  onSceneUpdate,
  backgroundUrl,
  isUploadingBackground,
  onBackgroundUpload
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);

  const [propertiesPanelOpen, setPropertiesPanelOpen] = React.useState(false);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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
          flexShrink: 0,
          height: 28,
          minHeight: 28
        }}
      >
        <Toolbar
          sx={{
            minHeight: 28,
            height: 28,
            py: 0,
            px: 0.5,
            '@media (min-width: 0px)': {
              minHeight: 28
            },
            '@media (min-width: 600px)': {
              minHeight: 28
            }
          }}
        >
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="Home"
            size="small"
            sx={{
              width: 20,
              height: 20,
              p: 0.25,
              mr: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <HomeIcon sx={{ fontSize: 14 }} />
          </IconButton>

          {scene && onBackClick && (
            <IconButton
              color="inherit"
              onClick={onBackClick}
              aria-label="Back"
              size="small"
              sx={{
                width: 20,
                height: 20,
                p: 0.25,
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}

          {scene && onSceneNameChange ? (
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '300px'
              }}
            >
              {scene.name}
            </Typography>
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontSize: 11,
                fontWeight: 600
              }}
            >
              VTT Tools
            </Typography>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
            size="small"
            sx={{
              width: 20,
              height: 20,
              p: 0.25,
              mr: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {currentTheme === 'light' ? <DarkMode sx={{ fontSize: 14 }} /> : <LightMode sx={{ fontSize: 14 }} />}
          </IconButton>

          {scene && (
            <IconButton
              color="inherit"
              onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
              aria-label="Settings"
              size="small"
              sx={{
                width: 20,
                height: 20,
                p: 0.25,
                backgroundColor: propertiesPanelOpen
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <SettingsIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {scene && (
        <ScenePropertiesDrawer
          open={propertiesPanelOpen}
          onClose={() => setPropertiesPanelOpen(false)}
          scene={scene}
          {...(onSceneNameChange && { onNameChange: onSceneNameChange })}
          onDescriptionChange={onSceneDescriptionChange ?? (() => {})}
          onPublishedChange={onScenePublishedChange ?? (() => {})}
          {...(onSceneUpdate && {
            onLightChange: (light: Light) => onSceneUpdate({ light }),
            onWeatherChange: (weather: Weather) => onSceneUpdate({ weather }),
            onElevationChange: (elevation: number) => onSceneUpdate({ elevation })
          })}
          {...(backgroundUrl && { backgroundUrl })}
          {...(isUploadingBackground !== undefined && { isUploadingBackground })}
          {...(onBackgroundUpload && { onBackgroundUpload })}
        />
      )}

      <Box component="main" sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </Box>
    </Box>
  );
};
