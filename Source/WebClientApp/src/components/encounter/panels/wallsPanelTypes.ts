import {
  BorderAll as WallIcon,
  DoorFront as DoorIcon,
  Fence as FenceIcon,
  Window as WindowIcon,
  MeetingRoom as PassageIcon,
  CropFree as OpeningIcon,
} from '@mui/icons-material';
import { SegmentType, SegmentState } from '@/types/domain';

export interface WallPreset {
  name: string;
  icon: typeof WallIcon;
  type: SegmentType;
  isOpaque: boolean;
  state: SegmentState;
}

/**
 * Wall presets define combinations of Type, IsOpaque, and State:
 * - Wall: Solid wall, blocks vision and movement (Type=Wall, IsOpaque=true, State=Visible)
 * - Fence: See-through barrier, blocks movement only (Type=Wall, IsOpaque=false, State=Visible)
 * - Door: Closed door, blocks vision and movement (Type=Door, IsOpaque=true, State=Closed)
 * - Window: Closed window, blocks vision and movement (Type=Window, IsOpaque=true, State=Closed)
 * - Passage: Open doorway, allows movement and vision (Type=Door, IsOpaque=false, State=Open)
 * - Opening: Open window, allows movement and vision (Type=Window, IsOpaque=false, State=Open)
 */
export const WALL_PRESETS: WallPreset[] = [
  {
    name: 'Wall',
    icon: WallIcon,
    type: SegmentType.Wall,
    isOpaque: true,
    state: SegmentState.Visible,
  },
  {
    name: 'Fence',
    icon: FenceIcon,
    type: SegmentType.Wall,
    isOpaque: false,
    state: SegmentState.Visible,
  },
  {
    name: 'Door',
    icon: DoorIcon,
    type: SegmentType.Door,
    isOpaque: true,
    state: SegmentState.Closed,
  },
  {
    name: 'Window',
    icon: WindowIcon,
    type: SegmentType.Window,
    isOpaque: true,
    state: SegmentState.Closed,
  },
  {
    name: 'Passage',
    icon: PassageIcon,
    type: SegmentType.Door,
    isOpaque: false,
    state: SegmentState.Open,
  },
  {
    name: 'Opening',
    icon: OpeningIcon,
    type: SegmentType.Window,
    isOpaque: false,
    state: SegmentState.Open,
  },
];
