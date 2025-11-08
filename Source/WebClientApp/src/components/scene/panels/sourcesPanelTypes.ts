import {
    FlashlightOn as SpotlightIcon,
    Lightbulb as LanternIcon,
    LocalFireDepartment as TorchIcon,
    Light as CandleIcon,
    VolumeUp as AmbientSoundIcon,
    GraphicEq as DirectionalSoundIcon,
    AutoAwesome as AuraIcon,
    PlayArrow as ConeEffectIcon
} from '@mui/icons-material';

export type SourceType = 'light' | 'sound' | 'effect';

export interface SourcePreset {
    name: string;
    icon: typeof SpotlightIcon;
    type: SourceType;
    isDirectional: boolean;
    defaultDirection: number;
    defaultSpread: number;
    defaultRange: number;
    defaultIntensity: number;
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
        defaultRange: 5,
        defaultIntensity: 100,
        defaultHasGradient: true,
        defaultColor: '#FF6B35'
    },
    {
        name: 'Lantern',
        icon: LanternIcon,
        type: 'light',
        isDirectional: false,
        defaultDirection: 0,
        defaultSpread: 0,
        defaultRange: 8,
        defaultIntensity: 100,
        defaultHasGradient: true,
        defaultColor: '#FFD93D'
    },
    {
        name: 'Candle',
        icon: CandleIcon,
        type: 'light',
        isDirectional: false,
        defaultDirection: 0,
        defaultSpread: 0,
        defaultRange: 2,
        defaultIntensity: 80,
        defaultHasGradient: true,
        defaultColor: '#FFF8DC'
    },
    {
        name: 'Spotlight',
        icon: SpotlightIcon,
        type: 'light',
        isDirectional: true,
        defaultDirection: 0,
        defaultSpread: 45,
        defaultRange: 15,
        defaultIntensity: 120,
        defaultHasGradient: true,
        defaultColor: '#FFFFFF'
    },
    {
        name: 'Ambient Sound',
        icon: AmbientSoundIcon,
        type: 'sound',
        isDirectional: false,
        defaultDirection: 0,
        defaultSpread: 0,
        defaultRange: 10,
        defaultIntensity: 100,
        defaultHasGradient: true,
        defaultColor: '#4A90E2'
    },
    {
        name: 'Directional Sound',
        icon: DirectionalSoundIcon,
        type: 'sound',
        isDirectional: true,
        defaultDirection: 0,
        defaultSpread: 60,
        defaultRange: 12,
        defaultIntensity: 100,
        defaultHasGradient: true,
        defaultColor: '#357ABD'
    },
    {
        name: 'Aura',
        icon: AuraIcon,
        type: 'effect',
        isDirectional: false,
        defaultDirection: 0,
        defaultSpread: 0,
        defaultRange: 3,
        defaultIntensity: 100,
        defaultHasGradient: false,
        defaultColor: '#9B59B6'
    },
    {
        name: 'Cone Effect',
        icon: ConeEffectIcon,
        type: 'effect',
        isDirectional: true,
        defaultDirection: 0,
        defaultSpread: 90,
        defaultRange: 10,
        defaultIntensity: 100,
        defaultHasGradient: false,
        defaultColor: '#E74C3C'
    }
];
