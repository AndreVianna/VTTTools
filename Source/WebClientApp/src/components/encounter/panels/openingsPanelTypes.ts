import {
  DoorFront as DoorIcon,
  Window as WindowIcon,
  Fence as GateIcon,
  CropPortrait as PortalIcon,
  MeetingRoom as DoubleDoorIcon,
  LockOpen as ArchIcon,
} from '@mui/icons-material';
import { OpeningOpacity, OpeningState, OpeningVisibility } from '@/types/domain';

export interface OpeningPreset {
  name: string;
  icon: typeof DoorIcon;
  type: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultVisibility: OpeningVisibility;
  defaultState: OpeningState;
  defaultOpacity: OpeningOpacity;
  defaultMaterial?: string;
  defaultColor?: string;
}

export const OPENING_PRESETS: OpeningPreset[] = [
  {
    name: 'Door',
    icon: DoorIcon,
    type: 'Door',
    defaultWidth: 5.0,
    defaultHeight: 8.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Closed,
    defaultOpacity: OpeningOpacity.Opaque,
    defaultMaterial: 'Wood',
    defaultColor: '#8B4513',
  },
  {
    name: 'Double Door',
    icon: DoubleDoorIcon,
    type: 'DoubleDoor',
    defaultWidth: 10.0,
    defaultHeight: 8.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Closed,
    defaultOpacity: OpeningOpacity.Opaque,
    defaultMaterial: 'Wood',
    defaultColor: '#8B4513',
  },
  {
    name: 'Window',
    icon: WindowIcon,
    type: 'Window',
    defaultWidth: 5.0,
    defaultHeight: 5.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Closed,
    defaultOpacity: OpeningOpacity.Translucent,
    defaultMaterial: 'Glass',
    defaultColor: '#87CEEB',
  },
  {
    name: 'Gate',
    icon: GateIcon,
    type: 'Gate',
    defaultWidth: 10.0,
    defaultHeight: 10.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Closed,
    defaultOpacity: OpeningOpacity.Transparent,
    defaultMaterial: 'Iron',
    defaultColor: '#696969',
  },
  {
    name: 'Portal',
    icon: PortalIcon,
    type: 'Portal',
    defaultWidth: 5.0,
    defaultHeight: 10.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Open,
    defaultOpacity: OpeningOpacity.Ethereal,
    defaultMaterial: 'Magic',
    defaultColor: '#9370DB',
  },
  {
    name: 'Arch',
    icon: ArchIcon,
    type: 'Arch',
    defaultWidth: 10.0,
    defaultHeight: 10.0,
    defaultVisibility: OpeningVisibility.Visible,
    defaultState: OpeningState.Open,
    defaultOpacity: OpeningOpacity.Transparent,
    defaultMaterial: 'Stone',
    defaultColor: '#A9A9A9',
  },
];

export const MATERIAL_OPTIONS = [
  'Wood',
  'Stone',
  'Iron',
  'Steel',
  'Glass',
  'Magic',
  'Custom',
];
