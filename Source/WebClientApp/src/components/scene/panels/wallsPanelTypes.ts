import {
    BorderAll as WallIcon,
    Fence as FenceIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { WallVisibility } from '@/types/domain';

export interface WallPreset {
    name: string;
    icon: typeof WallIcon;
    visibility: WallVisibility;
    material?: string;
    isClosed: boolean;
}

export const WALL_PRESETS: WallPreset[] = [
    { name: 'Normal Wall', icon: WallIcon, visibility: WallVisibility.Normal, material: 'Stone', isClosed: false },
    { name: 'Fence', icon: FenceIcon, visibility: WallVisibility.Fence, material: 'Wood', isClosed: false },
    { name: 'Invisible Wall', icon: VisibilityOffIcon, visibility: WallVisibility.Invisible, isClosed: false }
];

export const MATERIAL_OPTIONS = [
    'Stone',
    'Wood',
    'Metal',
    'Glass',
    'Energy',
    'Magic',
    'Force',
    'Custom'
];
