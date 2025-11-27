import {
  BorderAll as WallIcon,
  Fence as FenceIcon,
  VerticalShadesClosed as VeilIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { WallVisibility } from '@/types/domain';

export interface WallPreset {
  name: string;
  icon: typeof WallIcon;
  visibility: WallVisibility;
  isClosed: boolean;
}

export const WALL_PRESETS: WallPreset[] = [
  {
    name: 'Normal Wall',
    icon: WallIcon,
    visibility: WallVisibility.Normal,
    isClosed: false,
  },
  {
    name: 'Fence',
    icon: FenceIcon,
    visibility: WallVisibility.Fence,
    isClosed: false,
  },
  {
    name: 'Invisible Wall',
    icon: VisibilityOffIcon,
    visibility: WallVisibility.Invisible,
    isClosed: false,
  },
  {
    name: 'Veil',
    icon: VeilIcon,
    visibility: WallVisibility.Veil,
    isClosed: false,
  },
];
