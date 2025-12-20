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
  onPresetChange: (segmentIndex: number, type: SegmentType, isOpaque: boolean, state: SegmentState) => void;
  onStateChange: (segmentIndex: number, newState: SegmentState) => void;
}

interface SegmentPreset {
  key: string;
  label: string;
  type: SegmentType;
  isOpaque: boolean;
  defaultState: SegmentState;
}

const SEGMENT_PRESETS: SegmentPreset[] = [
  { key: 'wall', label: 'Wall', type: SegmentType.Wall, isOpaque: true, defaultState: SegmentState.Visible },
  { key: 'fence', label: 'Fence', type: SegmentType.Wall, isOpaque: false, defaultState: SegmentState.Visible },
  { key: 'door', label: 'Door', type: SegmentType.Door, isOpaque: true, defaultState: SegmentState.Closed },
  { key: 'window', label: 'Window', type: SegmentType.Window, isOpaque: true, defaultState: SegmentState.Closed },
  { key: 'passage', label: 'Passage', type: SegmentType.Door, isOpaque: false, defaultState: SegmentState.Open },
  { key: 'opening', label: 'Opening', type: SegmentType.Window, isOpaque: false, defaultState: SegmentState.Open },
];

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

function getPresetFromSegment(segment: EncounterWallSegment): SegmentPreset {
  const preset = SEGMENT_PRESETS.find(
    (p) => p.type === segment.type && p.isOpaque === segment.isOpaque
  );
  return preset ?? SEGMENT_PRESETS[0]!;
}

function isOpenOnlyPreset(type: SegmentType, isOpaque: boolean): boolean {
  return (type === SegmentType.Door || type === SegmentType.Window) && !isOpaque;
}

function getValidStatesForPreset(type: SegmentType, isOpaque: boolean): SegmentState[] {
  if (type === SegmentType.Wall) {
    return [SegmentState.Visible, SegmentState.Secret];
  }
  if (isOpenOnlyPreset(type, isOpaque)) {
    return [SegmentState.Open, SegmentState.Secret];
  }
  return [SegmentState.Open, SegmentState.Closed, SegmentState.Locked, SegmentState.Secret];
}

function normalizeStateForPreset(state: SegmentState, type: SegmentType, isOpaque: boolean): SegmentState {
  const validStates = getValidStatesForPreset(type, isOpaque);
  if (validStates.includes(state)) {
    return state;
  }
  if (state === SegmentState.Secret) {
    return SegmentState.Secret;
  }
  const preset = SEGMENT_PRESETS.find((p) => p.type === type && p.isOpaque === isOpaque);
  return preset?.defaultState ?? SegmentState.Visible;
}

export const SegmentRow: React.FC<SegmentRowProps> = React.memo(({ segment, onPresetChange, onStateChange }) => {
  const theme = useTheme();
  const currentPreset = getPresetFromSegment(segment);
  const isBarrierType = segment.type === SegmentType.Wall;
  const validStates = getValidStatesForPreset(segment.type, segment.isOpaque);
  const normalizedState = normalizeStateForPreset(segment.state, segment.type, segment.isOpaque);

  const handlePresetChange = (event: SelectChangeEvent<string>) => {
    const newPreset = SEGMENT_PRESETS.find((p) => p.key === event.target.value);
    if (newPreset) {
      const newState = normalizeStateForPreset(segment.state, newPreset.type, newPreset.isOpaque);
      onPresetChange(segment.index, newPreset.type, newPreset.isOpaque, newState);
    }
  };

  const handleStateChange = (event: SelectChangeEvent<SegmentState>) => {
    onStateChange(segment.index, event.target.value);
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
        <Select<string> value={currentPreset.key} onChange={handlePresetChange} sx={compactSelectStyle}>
          {SEGMENT_PRESETS.map((preset) => (
            <MenuItem key={preset.key} value={preset.key} sx={{ fontSize: '10px', py: 0.5 }}>
              {preset.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ flex: 1, minWidth: 0 }}>
        <Select<SegmentState> value={normalizedState} onChange={handleStateChange} sx={compactSelectStyle}>
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
