import React from 'react';
import { Box, IconButton, LinearProgress, Tooltip, Typography, useTheme } from '@mui/material';
import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import type { UploadState } from '@/hooks/useFileUpload';

export interface UploadProgressProps {
  uploadState: UploadState;
  onCancel?: () => void;
  compact?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ uploadState, onCancel, compact = false }) => {
  const theme = useTheme();
  const { isUploading, progress, fileName, error } = uploadState;

  if (!isUploading && !error && progress === 0) {
    return null;
  }

  const isComplete = !isUploading && !error && progress === 100;

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.5,
        }}
      >
        {isUploading && (
          <>
            <Box sx={{ flexGrow: 1, minWidth: 60 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }} />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'right' }}>
              {progress}%
            </Typography>
            {onCancel && (
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={onCancel} sx={{ p: 0.25 }}>
                  <CancelIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
        {isComplete && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
        {error && (
          <Tooltip title={error}>
            <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        border: '1px solid',
        borderColor: error ? 'error.main' : isComplete ? 'success.main' : 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: isUploading ? 1 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          {isComplete && <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />}
          {error && <ErrorIcon sx={{ fontSize: 18, color: 'error.main' }} />}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isUploading && (
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          )}
          {isUploading && onCancel && (
            <Tooltip title="Cancel upload">
              <IconButton size="small" onClick={onCancel} sx={{ p: 0.5 }}>
                <CancelIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {isUploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
          }}
        />
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default UploadProgress;
