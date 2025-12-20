import { Box, FormControl, Menu, MenuItem, Select, type SelectChangeEvent, Typography } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { type EncounterWall, type EncounterWallSegment, SegmentState, SegmentType } from '@/types/domain';

export interface WallContextMenuProps {
  anchorPosition: { left: number; top: number } | null;
  open: boolean;
  onClose: () => void;
  encounterWall: EncounterWall | null;
  segmentIndex: number | null;
  onSegmentUpdate?: (wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => void;
}

type VisualSegmentType = 'Wall' | 'Fence' | 'Door' | 'Passage' | 'Window' | 'Opening';

interface SegmentTypeConfig {
  type: SegmentType;
  isOpaque: boolean;
}

const VISUAL_TYPE_CONFIG: Record<VisualSegmentType, SegmentTypeConfig> = {
  Wall: { type: SegmentType.Wall, isOpaque: true },
  Fence: { type: SegmentType.Wall, isOpaque: false },
  Door: { type: SegmentType.Door, isOpaque: true },
  Passage: { type: SegmentType.Door, isOpaque: false },
  Window: { type: SegmentType.Window, isOpaque: true },
  Opening: { type: SegmentType.Window, isOpaque: false },
};

const VISUAL_TYPE_ORDER: VisualSegmentType[] = ['Wall', 'Fence', 'Door', 'Passage', 'Window', 'Opening'];

function getVisualType(segment: EncounterWallSegment): VisualSegmentType {
  switch (segment.type) {
    case SegmentType.Wall:
      return segment.isOpaque ? 'Wall' : 'Fence';
    case SegmentType.Door:
      return segment.isOpaque ? 'Door' : 'Passage';
    case SegmentType.Window:
      return segment.isOpaque ? 'Window' : 'Opening';
    default:
      return 'Wall';
  }
}

const SEGMENT_STATE_LABELS: Record<SegmentState, string> = {
  [SegmentState.Open]: 'Open',
  [SegmentState.Closed]: 'Closed',
  [SegmentState.Locked]: 'Locked',
  [SegmentState.Secret]: 'Secret',
};

function getValidStatesForVisualType(visualType: VisualSegmentType): SegmentState[] {
  if (visualType === 'Wall' || visualType === 'Fence') {
    return [SegmentState.Closed, SegmentState.Secret];
  }
  return [SegmentState.Open, SegmentState.Closed, SegmentState.Locked, SegmentState.Secret];
}

function getDefaultStateForVisualType(visualType: VisualSegmentType): SegmentState {
  if (visualType === 'Wall' || visualType === 'Fence') {
    return SegmentState.Closed;
  }
  return SegmentState.Closed;
}

function normalizeStateForVisualType(state: SegmentState, visualType: VisualSegmentType): SegmentState {
  const validStates = getValidStatesForVisualType(visualType);
  if (validStates.includes(state)) {
    return state;
  }
  return getDefaultStateForVisualType(visualType);
}

function getSegmentTitle(segment: EncounterWallSegment): string {
  if (segment.name) {
    return segment.name;
  }
  const visualType = getVisualType(segment);
  return `${visualType} ${segment.index + 1}`;
}

export const WallContextMenu: React.FC<WallContextMenuProps> = ({
  anchorPosition,
  open,
  onClose,
  encounterWall,
  segmentIndex,
  onSegmentUpdate,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [open, handleClickOutside]);

  if (!encounterWall) return null;

  const segment = segmentIndex !== null ? encounterWall.segments.find((s) => s.index === segmentIndex) : null;
  const visualType = segment ? getVisualType(segment) : 'Wall';
  const validStates = getValidStatesForVisualType(visualType);
  const normalizedState = segment ? normalizeStateForVisualType(segment.state, visualType) : SegmentState.Closed;

  const handleVisualTypeChange = (event: SelectChangeEvent<string>) => {
    if (segmentIndex === null || !onSegmentUpdate || !segment) return;
    const newVisualType = event.target.value as VisualSegmentType;
    const config = VISUAL_TYPE_CONFIG[newVisualType];
    const newState = normalizeStateForVisualType(segment.state, newVisualType);
    onSegmentUpdate(encounterWall.index, segmentIndex, {
      type: config.type,
      isOpaque: config.isOpaque,
      state: newState,
    });
  };

  const handleStateChange = (event: SelectChangeEvent<SegmentState>) => {
    if (segmentIndex === null || !onSegmentUpdate) return;
    const newState = event.target.value;
    onSegmentUpdate(encounterWall.index, segmentIndex, { state: newState });
  };

  const compactSelectStyle = {
    height: '28px',
    fontSize: '11px',
    minWidth: 100,
    '& .MuiSelect-select': {
      padding: '4px 28px 4px 8px',
      fontSize: '11px',
    },
  };

  return (
    <Menu
      anchorReference='anchorPosition'
      {...(anchorPosition && { anchorPosition })}
      open={open}
      onClose={onClose}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        backdrop: {
          invisible: true,
          sx: { pointerEvents: 'none' },
        },
        paper: {
          ref: menuRef,
          sx: { pointerEvents: 'auto' },
        },
        root: {
          sx: { pointerEvents: 'none' },
        },
      }}
    >
      {segment && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant='subtitle2' sx={{ fontSize: '11px', fontWeight: 600, mb: 1 }}>
            {getSegmentTitle(segment)}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '10px', minWidth: 40 }}>Type:</Typography>
              <FormControl size='small'>
                <Select value={visualType} onChange={handleVisualTypeChange} sx={compactSelectStyle}>
                  {VISUAL_TYPE_ORDER.map((vType) => (
                    <MenuItem key={vType} value={vType} sx={{ fontSize: '11px' }}>
                      {vType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '10px', minWidth: 40 }}>State:</Typography>
              <FormControl size='small'>
                <Select<SegmentState> value={normalizedState} onChange={handleStateChange} sx={compactSelectStyle}>
                  {validStates.map((state) => (
                    <MenuItem key={state} value={state} sx={{ fontSize: '11px' }}>
                      {SEGMENT_STATE_LABELS[state]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )}
    </Menu>
  );
};
