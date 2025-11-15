import {
  Add as AddIcon,
  DrawOutlined as DrawPolygonIcon,
  FormatColorFill as BucketFillIcon,
  Remove as SubtractIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

export interface FogOfWarPanelProps {
  encounterId?: string;
  onHideAll: () => void;
  onRevealAll: () => void;
  onModeChange: (mode: 'add' | 'subtract') => void;
  onDrawPolygon: () => void;
  onBucketFill: () => void;
  currentMode: 'add' | 'subtract';
}

export const FogOfWarPanel: React.FC<FogOfWarPanelProps> = React.memo(
  ({
    onHideAll,
    onRevealAll,
    onModeChange,
    onDrawPolygon,
    onBucketFill,
    currentMode,
  }) => {
    const theme = useTheme();

    const compactStyles = {
      sectionHeader: {
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        color: theme.palette.text.secondary,
        mb: 0.5,
      },
      button: {
        height: '28px',
        fontSize: '10px',
        borderRadius: 0,
        textTransform: 'none' as const,
      },
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Quick Actions
        </Typography>

        <ButtonGroup fullWidth variant='contained' sx={{ height: '28px' }}>
          <Button
            id='btn-fog-hide-all'
            onClick={onHideAll}
            startIcon={<VisibilityOffIcon sx={{ fontSize: '14px' }} />}
            sx={compactStyles.button}
          >
            Hide All
          </Button>
          <Button
            id='btn-fog-reveal-all'
            onClick={onRevealAll}
            startIcon={<VisibilityIcon sx={{ fontSize: '14px' }} />}
            sx={compactStyles.button}
          >
            Reveal All
          </Button>
        </ButtonGroup>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Mode
        </Typography>

        <ToggleButtonGroup
          value={currentMode}
          exclusive
          onChange={(_, newMode) => {
            if (newMode !== null) {
              onModeChange(newMode);
            }
          }}
          fullWidth
          sx={{
            height: '28px',
            '& .MuiToggleButton-root': {
              fontSize: '10px',
              textTransform: 'none',
              borderRadius: 0,
            },
          }}
        >
          <ToggleButton
            id='btn-fog-mode-add'
            value='add'
            aria-label='add fog'
          >
            <AddIcon sx={{ fontSize: '14px', mr: 0.5 }} />
            Add
          </ToggleButton>
          <ToggleButton
            id='btn-fog-mode-subtract'
            value='subtract'
            aria-label='subtract fog'
          >
            <SubtractIcon sx={{ fontSize: '14px', mr: 0.5 }} />
            Subtract
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Drawing Tools
        </Typography>

        <Button
          id='btn-fog-draw-polygon'
          variant='outlined'
          onClick={onDrawPolygon}
          startIcon={<DrawPolygonIcon sx={{ fontSize: '14px' }} />}
          fullWidth
          sx={compactStyles.button}
        >
          Draw Polygon
        </Button>

        <Button
          id='btn-fog-bucket-fill'
          variant='outlined'
          onClick={onBucketFill}
          startIcon={<BucketFillIcon sx={{ fontSize: '14px' }} />}
          fullWidth
          sx={compactStyles.button}
        >
          Bucket Fill
        </Button>
      </Box>
    );
  },
);

FogOfWarPanel.displayName = 'FogOfWarPanel';
