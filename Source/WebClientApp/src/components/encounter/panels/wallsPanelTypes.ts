import {
  BorderAll as WallIcon,
  DoorFront as DoorIcon,
  Fence as FenceIcon,
  Window as WindowIcon,
  Doorbell as PassagewayIcon,
  Adjust as OpeningIcon,
} from '@mui/icons-material';
import { SegmentType } from '@/types/domain';

export interface WallPreset {
  name: string;
  icon: typeof WallIcon;
  segmentType: SegmentType;
}

export const WALL_PRESETS: WallPreset[] = [
  {
    name: 'Wall',
    icon: WallIcon,
    segmentType: SegmentType.Wall,
  },
  {
    name: 'Fence',
    icon: FenceIcon,
    segmentType: SegmentType.Fence,
  },
  {
    name: 'Door',
    icon: DoorIcon,
    segmentType: SegmentType.Door,
  },
  {
    name: 'Window',
    icon: WindowIcon,
    segmentType: SegmentType.Window,
  },
  {
    name: 'Passage',
    icon: PassagewayIcon,
    segmentType: SegmentType.Passage,
  },
  {
    name: 'Opening',
    icon: OpeningIcon,
    segmentType: SegmentType.Opening,
  },
];
