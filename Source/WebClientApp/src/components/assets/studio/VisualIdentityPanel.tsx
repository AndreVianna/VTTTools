import React from 'react';
import { Box, Button, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import type { MediaResource } from '@/types/domain';
import { ResourceImage } from '@/components/common/ResourceImage';

export interface VisualIdentityPanelProps {
  portrait: MediaResource | null;
  tokens: MediaResource[];
  onPortraitChange: (resource: MediaResource | null) => void;
  onTokensChange: (tokens: MediaResource[]) => void;
  onSelectPortrait: () => void;
  onSelectToken: () => void;
}

export const VisualIdentityPanel: React.FC<VisualIdentityPanelProps> = ({
  portrait,
  tokens,
  onPortraitChange,
  onTokensChange,
  onSelectPortrait,
  onSelectToken,
}) => {
  const theme = useTheme();

  const handleRemoveToken = (index: number) => {
    const newTokens = [...tokens];
    newTokens.splice(index, 1);
    onTokensChange(newTokens);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Portrait Section */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Portrait
      </Typography>

      <Box
        sx={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: theme.palette.action.hover,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          mb: 3,
          '&:hover .portrait-overlay': {
            opacity: 1,
          },
        }}
        onClick={onSelectPortrait}
      >
        {portrait ? (
          <>
            <ResourceImage
              resourceId={portrait.id}
              alt="Portrait"
              objectFit="contain"
              loadingSize={32}
            />
            <Box
              className="portrait-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <Typography variant="body2" sx={{ color: 'white' }}>
                Click to change
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <ImageIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Click to add portrait
            </Typography>
          </Box>
        )}
      </Box>

      {portrait && (
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onPortraitChange(null)}
          sx={{ mb: 3 }}
        >
          Remove Portrait
        </Button>
      )}

      {/* Tokens Section */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Tokens ({tokens.length})
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
        }}
      >
        {tokens.map((token, index) => (
          <Box
            key={token.id}
            sx={{
              aspectRatio: '1',
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
              '&:hover .token-delete': {
                opacity: 1,
              },
            }}
          >
            <ResourceImage
              resourceId={token.id}
              alt={`Token ${index + 1}`}
              objectFit="contain"
              loadingSize={20}
              sx={{
                background: `repeating-conic-gradient(${theme.palette.action.hover} 0% 25%, transparent 0% 50%) 50% / 16px 16px`,
              }}
            />
            <Tooltip title="Remove token">
              <IconButton
                className="token-delete"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  },
                }}
                onClick={() => handleRemoveToken(index)}
              >
                <DeleteIcon sx={{ fontSize: 16, color: 'white' }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {/* Add Token Button */}
        <Box
          sx={{
            aspectRatio: '1',
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: `2px dashed ${theme.palette.divider}`,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.action.selected,
            },
          }}
          onClick={onSelectToken}
        >
          <AddIcon sx={{ color: theme.palette.text.secondary }} />
        </Box>
      </Box>
    </Box>
  );
};

export default VisualIdentityPanel;
