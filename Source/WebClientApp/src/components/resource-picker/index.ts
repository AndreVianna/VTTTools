// Types and configurations
export type {
    ResourceContentType,
    ResourcePickerConfig,
    ResourcePickerState,
    ResourcePickerDialogProps,
    ResourcePickerFiltersProps,
    ResourcePickerGridProps,
    ResourcePickerPreviewProps,
} from './types';

export {
    BACKGROUND_PICKER_CONFIG,
    AMBIENT_SOUND_PICKER_CONFIG,
} from './types';

// Hook
export { useResourcePicker } from './useResourcePicker';
export type { UseResourcePickerOptions, UseResourcePickerReturn } from './useResourcePicker';

// Components (will be added as they're created)
export { ResourcePickerDialog } from './ResourcePickerDialog';
export { ResourcePickerFilters } from './ResourcePickerFilters';
export { ResourcePickerGrid } from './ResourcePickerGrid';
export { ResourcePickerPreview } from './ResourcePickerPreview';
export { DimensionSlider } from './DimensionSlider';
export type { DimensionSliderProps } from './DimensionSlider';

export { DurationSlider } from './DurationSlider';
export type { DurationSliderProps } from './DurationSlider';

export { MediaTypeFilter } from './MediaTypeFilter';
export type { MediaTypeFilterProps } from './MediaTypeFilter';
