import {
  Box,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { type EncounterWallSegment, SegmentState, SegmentType } from '@/types/domain';

export interface SegmentRowProps {
  segment: EncounterWallSegment;
  onTypeChange: (segmentIndex: number, newType: SegmentType, newState: SegmentState) => void;
  onStateChange: (segmentIndex: number, newState: SegmentState) => void;
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

export const SegmentRow: React.FC<SegmentRowProps> = React.memo(({ segment, onTypeChange, onStateChange }) => {
  const theme = useTheme();
  const isBarrierType = isBarrier(segment.type);
  const validStates = getValidStatesForType(segment.type);
  const normalizedState = normalizeStateForType(segment.state, segment.type);

  const handleTypeChange = (event: SelectChangeEvent<number>) => {
    const newType = event.target.value as SegmentType;
    const newState = normalizeStateForType(segment.state, newType);
    onTypeChange(segment.index, newType, newState);
  };

  const handleStateChange = (event: SelectChangeEvent<number>) => {
    onStateChange(segment.index, event.target.value as SegmentState);
  };

  const compactSelectStyle = {
    height: '24px',
    fontSize: '10px',
    '& .MuiSelect-select': {
      padding: '2px 24px 2px 6px',
      fontSize: '10px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        py: 0.25,
        px: 0.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: '9px',
          color: theme.palette.text.secondary,
          minWidth: 20,
          textAlign: 'center',
        }}
      >
        [{segment.index + 1}]
      </Typography>

      <FormControl size='small' sx={{ flex: 1, minWidth: 0 }}>
        <Select value={segment.type} onChange={handleTypeChange} sx={compactSelectStyle}>
          {Object.entries(SEGMENT_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)} sx={{ fontSize: '10px', py: 0.5 }}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ flex: 1, minWidth: 0 }}>
        <Select<number> value={normalizedState} onChange={handleStateChange} sx={compactSelectStyle}>
          {validStates.map((state) => (
            <MenuItem key={state} value={state} sx={{ fontSize: '10px', py: 0.5 }}>
              {isBarrierType ? BARRIER_STATE_LABELS[state] : SEGMENT_STATE_LABELS[state]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});

SegmentRow.displayName = 'SegmentRow';
