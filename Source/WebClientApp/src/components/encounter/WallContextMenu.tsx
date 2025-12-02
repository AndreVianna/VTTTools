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

const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  [SegmentType.Wall]: 'Wall',
  [SegmentType.Fence]: 'Fence',
  [SegmentType.Door]: 'Door',
  [SegmentType.Passage]: 'Passage',
  [SegmentType.Window]: 'Window',
  [SegmentType.Opening]: 'Opening',
};

const SEGMENT_STATE_LABELS: Record<SegmentState, string> = {
  [SegmentState.Open]: 'Open',
  [SegmentState.Closed]: 'Closed',
  [SegmentState.Locked]: 'Locked',
  [SegmentState.Secret]: 'Secret',
};

const BARRIER_STATE_LABELS: Partial<Record<SegmentState, string>> = {
  [SegmentState.Visible]: 'Visible',
  [SegmentState.Secret]: 'Hidden',
};

const BARRIER_TYPES = [SegmentType.Wall, SegmentType.Fence];
const OPEN_ONLY_TYPES = [SegmentType.Passage, SegmentType.Opening];

function isBarrier(type: SegmentType): boolean {
  return BARRIER_TYPES.includes(type);
}

function isOpenOnly(type: SegmentType): boolean {
  return OPEN_ONLY_TYPES.includes(type);
}

function getValidStatesForType(type: SegmentType): SegmentState[] {
  if (isBarrier(type)) {
    return [SegmentState.Visible, SegmentState.Secret];
  }
  if (isOpenOnly(type)) {
    return [SegmentState.Open, SegmentState.Secret];
  }
  return [SegmentState.Open, SegmentState.Closed, SegmentState.Locked, SegmentState.Secret];
}

function getDefaultStateForType(type: SegmentType): SegmentState {
  if (isBarrier(type)) {
    return SegmentState.Visible;
  }
  if (type === SegmentType.Door || type === SegmentType.Window) {
    return SegmentState.Closed;
  }
  return SegmentState.Open;
}

function normalizeStateForType(state: SegmentState, type: SegmentType): SegmentState {
  const validStates = getValidStatesForType(type);
  if (validStates.includes(state)) {
    return state;
  }
  if (state === SegmentState.Secret) {
    return SegmentState.Secret;
  }
  return getDefaultStateForType(type);
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
  const isBarrierType = segment ? isBarrier(segment.type) : false;
  const validStates = segment ? getValidStatesForType(segment.type) : [];
  const normalizedState = segment ? normalizeStateForType(segment.state, segment.type) : SegmentState.Open;

  const handleTypeChange = (event: SelectChangeEvent<number>) => {
    if (segmentIndex === null || !onSegmentUpdate || !segment) return;
    const newType = event.target.value as SegmentType;
    const newState = normalizeStateForType(segment.state, newType);
    onSegmentUpdate(encounterWall.index, segmentIndex, { type: newType, state: newState });
  };

  const handleStateChange = (event: SelectChangeEvent<number>) => {
    if (segmentIndex === null || !onSegmentUpdate) return;
    const newState = event.target.value as SegmentState;
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
            Segment {segment.index + 1}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '10px', minWidth: 40 }}>Type:</Typography>
              <FormControl size='small'>
                <Select value={segment.type} onChange={handleTypeChange} sx={compactSelectStyle}>
                  {Object.entries(SEGMENT_TYPE_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)} sx={{ fontSize: '11px' }}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '10px', minWidth: 40 }}>State:</Typography>
              <FormControl size='small'>
                <Select value={normalizedState} onChange={handleStateChange} sx={compactSelectStyle}>
                  {validStates.map((state) => (
                    <MenuItem key={state} value={state} sx={{ fontSize: '11px' }}>
                      {isBarrierType ? BARRIER_STATE_LABELS[state] : SEGMENT_STATE_LABELS[state]}
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
