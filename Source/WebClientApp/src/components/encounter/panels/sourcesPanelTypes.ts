import {
  VolumeUp as AmbientSoundIcon,
  AutoAwesome as AuraIcon,
  Light as CandleIcon,
  PlayArrow as ConeEffectIcon,
  GraphicEq as DirectionalSoundIcon,
  Lightbulb as LanternIcon,
  FlashlightOn as SpotlightIcon,
  LocalFireDepartment as TorchIcon,
} from '@mui/icons-material';

export type SourceType = 'light' | 'sound' | 'effect';

export interface SourcePreset {
  name: string;
  icon: typeof SpotlightIcon;
  type: SourceType;
  isDirectional: boolean;
  defaultDirection: number;
  defaultSpread: number;
  defaultHasGradient: boolean;
  defaultColor: string;
}

export const SOURCE_PRESETS: SourcePreset[] = [
  {
    name: 'Torch',
    icon: TorchIcon,
    type: 'light',
    isDirectional: false,
    defaultDirection: 0,
    defaultSpread: 0,
    defaultHasGradient: true,
    defaultColor: '#FF6B35',
  },
  {
    name: 'Lantern',
    icon: LanternIcon,
    type: 'light',
    isDirectional: false,
    defaultDirection: 0,
    defaultSpread: 0,
    defaultHasGradient: true,
    defaultColor: '#FFD93D',
  },
  {
    name: 'Candle',
    icon: CandleIcon,
    type: 'light',
    isDirectional: false,
    defaultDirection: 0,
    defaultSpread: 0,
    defaultHasGradient: true,
    defaultColor: '#FFF8DC',
  },
  {
    name: 'Spotlight',
    icon: SpotlightIcon,
    type: 'light',
    isDirectional: true,
    defaultDirection: 0,
    defaultSpread: 45,
    defaultHasGradient: true,
    defaultColor: '#FFFFFF',
  },
  {
    name: 'Ambient Sound',
    icon: AmbientSoundIcon,
    type: 'sound',
    isDirectional: false,
    defaultDirection: 0,
    defaultSpread: 0,
    defaultHasGradient: true,
    defaultColor: '#4A90E2',
  },
  {
    name: 'Directional Sound',
    icon: DirectionalSoundIcon,
    type: 'sound',
    isDirectional: true,
    defaultDirection: 0,
    defaultSpread: 60,
    defaultHasGradient: true,
    defaultColor: '#357ABD',
  },
  {
    name: 'Aura',
    icon: AuraIcon,
    type: 'effect',
    isDirectional: false,
    defaultDirection: 0,
    defaultSpread: 0,
    defaultHasGradient: false,
    defaultColor: '#9B59B6',
  },
  {
    name: 'Cone Effect',
    icon: ConeEffectIcon,
    type: 'effect',
    isDirectional: true,
    defaultDirection: 0,
    defaultSpread: 90,
    defaultHasGradient: false,
    defaultColor: '#E74C3C',
  },
];
