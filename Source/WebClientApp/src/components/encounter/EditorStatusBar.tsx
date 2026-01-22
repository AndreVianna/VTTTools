import { Pause, PlayArrow, VolumeOff, VolumeUp } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type React from 'react';

export interface EditorStatusBarProps {
  totalAssets?: number;
  selectedCount?: number;
  zoomPercentage?: number;
  activeTool?: string;
  /** Whether the encounter has a grid configured (not NoGrid) */
  hasGrid?: boolean;
  gridSnapEnabled?: boolean;
  /** Whether the background is a video (shows video controls) */
  hasVideoBackground?: boolean;
  /** Whether video is currently playing */
  isVideoPlaying?: boolean;
  /** Callback when video play/pause is toggled */
  onVideoPlayPauseToggle?: () => void;
  /** Whether video audio is currently muted */
  isAudioMuted?: boolean;
  /** Callback when audio mute is toggled */
  onAudioMuteToggle?: () => void;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  totalAssets = 0,
  selectedCount = 0,
  zoomPercentage = 100,
  activeTool,
  hasGrid = false,
  gridSnapEnabled,
  hasVideoBackground = false,
  isVideoPlaying = true,
  onVideoPlayPauseToggle,
  isAudioMuted = true,
  onAudioMuteToggle,
}) => {
  const theme = useTheme();

  return (
    <Box
      component='footer'
      sx={{
        height: 20,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        gap: 2,
        flexShrink: 0,
      }}
    >
      <Typography
        variant='caption'
        sx={{
          fontSize: 9,
          color: theme.palette.text.secondary,
        }}
      >
        Assets: {totalAssets}
      </Typography>

      {selectedCount > 0 && (
        <Typography
          variant='caption'
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary,
          }}
        >
          Selected: {selectedCount}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {activeTool && (
        <Typography
          variant='caption'
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary,
          }}
        >
          Tool: {activeTool}
        </Typography>
      )}

      {hasGrid && gridSnapEnabled !== undefined && (
        <Typography
          variant='caption'
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary,
          }}
        >
          Snap: {gridSnapEnabled ? 'ON' : 'OFF'}
        </Typography>
      )}

      {hasVideoBackground && onVideoPlayPauseToggle && (
        <Tooltip title={isVideoPlaying ? 'Pause video' : 'Play video'}>
          <IconButton
            size='small'
            onClick={onVideoPlayPauseToggle}
            sx={{
              padding: 0,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            {isVideoPlaying ? <Pause sx={{ fontSize: 14 }} /> : <PlayArrow sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>
      )}

      {hasVideoBackground && onAudioMuteToggle && (
        <Tooltip title={isAudioMuted ? 'Unmute video audio' : 'Mute video audio'}>
          <IconButton
            size='small'
            onClick={onAudioMuteToggle}
            sx={{
              padding: 0,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            {isAudioMuted ? <VolumeOff sx={{ fontSize: 14 }} /> : <VolumeUp sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>
      )}

      <Typography
        variant='caption'
        sx={{
          fontSize: 9,
          color: theme.palette.text.secondary,
          fontFamily: 'monospace',
        }}
      >
        {Math.round(zoomPercentage)}%
      </Typography>
    </Box>
  );
};
