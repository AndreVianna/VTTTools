import {
  ArrowBack as ArrowBackIcon,
  DarkMode,
  Home as HomeIcon,
  LightMode,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AppBar, Box, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EncounterPropertiesDrawer } from '@/components/encounter';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectTheme, toggleTheme } from '@/store/slices/uiSlice';
import type { Encounter, MediaResource } from '@/types/domain';
import { Weather } from '@/types/domain';
import { type AmbientLight, type AmbientSoundSource } from '@/types/stage';
import type { GridConfig } from '@/utils/gridCalculator';

interface EditorLayoutProps {
  children: React.ReactNode;
  encounter?: Encounter | undefined;
  onEncounterNameChange?: (name: string) => void;
  onBackClick?: () => void;
  onEncounterDescriptionChange?: (description: string) => void;
  onEncounterPublishedChange?: (published: boolean) => void;
  onStageSettingsChange?: (updates: { ambientLight?: AmbientLight; weather?: Weather }) => void;
  gridConfig?: GridConfig;
  onGridChange?: (grid: GridConfig) => void;
  // Main (DM) Background
  backgroundUrl?: string;
  backgroundContentType?: string;
  isUploadingBackground?: boolean;
  onBackgroundUpload?: (file: File) => void;
  onBackgroundSelect?: (resource: MediaResource) => void;
  onBackgroundRemove?: () => void;
  // Alternate (Player) Background
  useAlternateBackground?: boolean;
  onUseAlternateBackgroundChange?: (enabled: boolean) => void;
  alternateBackgroundUrl?: string;
  alternateBackgroundContentType?: string;
  isUploadingAlternateBackground?: boolean;
  onAlternateBackgroundUpload?: (file: File) => void;
  onAlternateBackgroundSelect?: (resource: MediaResource) => void;
  onAlternateBackgroundRemove?: () => void;
  // Ambient Sound
  ambientSoundSource?: AmbientSoundSource;
  onAmbientSoundSourceChange?: (source: AmbientSoundSource) => void;
  ambientSoundUrl?: string;
  isUploadingAmbientSound?: boolean;
  onAmbientSoundUpload?: (file: File) => void;
  onAmbientSoundSelect?: (resource: MediaResource) => void;
  onAmbientSoundRemove?: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  encounter,
  onEncounterNameChange,
  onBackClick,
  onEncounterDescriptionChange,
  onEncounterPublishedChange,
  onStageSettingsChange,
  gridConfig,
  onGridChange,
  // Main (DM) Background
  backgroundUrl,
  backgroundContentType,
  isUploadingBackground,
  onBackgroundUpload,
  onBackgroundSelect,
  onBackgroundRemove,
  // Alternate (Player) Background
  useAlternateBackground,
  onUseAlternateBackgroundChange,
  alternateBackgroundUrl,
  alternateBackgroundContentType,
  isUploadingAlternateBackground,
  onAlternateBackgroundUpload,
  onAlternateBackgroundSelect,
  onAlternateBackgroundRemove,
  // Ambient Sound
  ambientSoundSource,
  onAmbientSoundSourceChange,
  ambientSoundUrl,
  isUploadingAmbientSound,
  onAmbientSoundUpload,
  onAmbientSoundSelect,
  onAmbientSoundRemove,
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppBar
        component='header'
        position='static'
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          flexShrink: 0,
          height: 28,
          minHeight: 28,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 28,
            height: 28,
            py: 0,
            px: 0.5,
            '@media (min-width: 0px)': {
              minHeight: 28,
            },
            '@media (min-width: 600px)': {
              minHeight: 28,
            },
          }}
        >
          <IconButton
            color='inherit'
            onClick={() => navigate('/')}
            aria-label='Home'
            size='small'
            sx={{
              width: 20,
              height: 20,
              p: 0.25,
              mr: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 14 }} />
          </IconButton>

          {encounter && onBackClick && (
            <IconButton
              color='inherit'
              onClick={onBackClick}
              aria-label='Back'
              size='small'
              sx={{
                width: 20,
                height: 20,
                p: 0.25,
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}

          {encounter && onEncounterNameChange ? (
            <Typography
              variant='h6'
              component='div'
              sx={{
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '300px',
              }}
            >
              {encounter.name || encounter.stage?.name || 'New Encounter'}
            </Typography>
          ) : (
            <Typography
              variant='h6'
              component='div'
              sx={{
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              VTT Tools
            </Typography>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color='inherit'
            onClick={handleThemeToggle}
            aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
            size='small'
            sx={{
              width: 20,
              height: 20,
              p: 0.25,
              mr: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {currentTheme === 'light' ? <DarkMode sx={{ fontSize: 14 }} /> : <LightMode sx={{ fontSize: 14 }} />}
          </IconButton>

          {encounter && (
            <IconButton
              color='inherit'
              onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
              aria-label='Settings'
              size='small'
              sx={{
                width: 20,
                height: 20,
                p: 0.25,
                backgroundColor: propertiesPanelOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <SettingsIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {encounter && (
        <EncounterPropertiesDrawer
          open={propertiesPanelOpen}
          onClose={() => setPropertiesPanelOpen(false)}
          encounter={encounter}
          {...(onEncounterNameChange && {
            onNameChange: onEncounterNameChange,
          })}
          onDescriptionChange={onEncounterDescriptionChange ?? (() => {})}
          onPublishedChange={onEncounterPublishedChange ?? (() => {})}
          {...(onStageSettingsChange && {
            onLightChange: (ambientLight: AmbientLight) => onStageSettingsChange({ ambientLight }),
            onWeatherChange: (weather: Weather) => onStageSettingsChange({ weather }),
          })}
          {...(gridConfig && { gridConfig })}
          {...(onGridChange && { onGridChange })}
          // Main (DM) Background
          {...(backgroundUrl && { backgroundUrl })}
          {...(backgroundContentType && { backgroundContentType })}
          {...(isUploadingBackground !== undefined && { isUploadingBackground })}
          {...(onBackgroundUpload && { onBackgroundUpload })}
          {...(onBackgroundSelect && { onBackgroundSelect })}
          {...(onBackgroundRemove && { onBackgroundRemove })}
          // Alternate (Player) Background
          {...(useAlternateBackground !== undefined && { useAlternateBackground })}
          {...(onUseAlternateBackgroundChange && { onUseAlternateBackgroundChange })}
          {...(alternateBackgroundUrl && { alternateBackgroundUrl })}
          {...(alternateBackgroundContentType && { alternateBackgroundContentType })}
          {...(isUploadingAlternateBackground !== undefined && { isUploadingAlternateBackground })}
          {...(onAlternateBackgroundUpload && { onAlternateBackgroundUpload })}
          {...(onAlternateBackgroundSelect && { onAlternateBackgroundSelect })}
          {...(onAlternateBackgroundRemove && { onAlternateBackgroundRemove })}
          // Ambient Sound
          {...(ambientSoundSource !== undefined && { ambientSoundSource })}
          {...(onAmbientSoundSourceChange && { onAmbientSoundSourceChange })}
          {...(ambientSoundUrl && { ambientSoundUrl })}
          {...(isUploadingAmbientSound !== undefined && { isUploadingAmbientSound })}
          {...(onAmbientSoundUpload && { onAmbientSoundUpload })}
          {...(onAmbientSoundSelect && { onAmbientSoundSelect })}
          {...(onAmbientSoundRemove && { onAmbientSoundRemove })}
        />
      )}

      <Box component='main' sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </Box>
    </Box>
  );
};
