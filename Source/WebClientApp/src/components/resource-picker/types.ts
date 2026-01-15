import type { MediaResource, ResourceRole } from '@/types/domain';

export type ResourceContentType = 'image' | 'video' | 'audio' | 'mixed';

/**
 * Configuration for the ResourcePickerDialog.
 * Use preset configs (BACKGROUND_PICKER_CONFIG, AMBIENT_SOUND_PICKER_CONFIG) or create custom ones.
 */
export interface ResourcePickerConfig {
    /** Allowed resource roles to filter by */
    allowedRoles: ResourceRole[];
    /** Content type hint for UI (grid vs list default) */
    contentTypeHint?: ResourceContentType;
    /** Default role for new uploads */
    defaultUploadRole?: ResourceRole;
    /** Accepted file types for upload (MIME types) */
    acceptedFileTypes?: string;
    /** Dialog title */
    title?: string;
    /** Select button label */
    selectButtonLabel?: string;
}

/**
 * Internal state for the resource picker.
 */
export interface ResourcePickerState {
    searchQuery: string;
    ownershipFilter: 'mine' | 'all';
    selectedResourceId: string | null;
    viewMode: 'grid' | 'list';
    mediaTypeFilter: string[];  // ['image', 'video', or both]
    dimensionRange: [number, number] | null;  // null = no filter
    durationRange: [number, number] | null;  // null = no filter
    isPreviewCollapsed: boolean;
    currentSkip: number;  // For pagination
}

/**
 * Props for the ResourcePickerDialog component.
 */
export interface ResourcePickerDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when a resource is selected */
    onSelect: (resource: MediaResource) => void;
    /** Currently selected resource ID (for highlighting) */
    currentResourceId?: string;
    /** Configuration for the picker */
    config: ResourcePickerConfig;
}

/**
 * Props for the ResourcePickerFilters component.
 */
export interface ResourcePickerFiltersProps {
    // Existing props
    searchQuery: string;
    onSearchChange: (query: string) => void;
    ownershipFilter: 'mine' | 'all';
    onOwnershipChange: (filter: 'mine' | 'all') => void;
    acceptedFileTypes?: string | undefined;
    defaultUploadRole?: ResourceRole | undefined;
    onUploadComplete: () => void;

    // Content type hint for showing appropriate filters
    contentTypeHint?: ResourceContentType | undefined;

    // Media type filter (Image/Video checkboxes)
    mediaTypeFilter?: string[];
    onMediaTypeChange?: (types: string[]) => void;

    // Dimension range filter
    dimensionRange?: [number, number] | null;  // null = no filter
    onDimensionRangeChange?: (range: [number, number] | null) => void;

    // Duration range filter
    durationRange?: [number, number] | null;  // null = no filter
    onDurationRangeChange?: (range: [number, number] | null) => void;
    maxDurationMs?: number;  // From API response
}

/**
 * Props for the ResourcePickerGrid component.
 */
export interface ResourcePickerGridProps {
    resources: MediaResource[];
    isLoading: boolean;
    selectedResourceId: string | null;
    onSelect: (resource: MediaResource) => void;
    viewMode: 'grid' | 'list';
    contentTypeHint?: ResourceContentType | undefined;

    // Infinite scroll props
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

/**
 * Props for the ResourcePickerPreview component.
 */
export interface ResourcePickerPreviewProps {
    resource: MediaResource | null;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Configuration for selecting background images/videos.
 */
export const BACKGROUND_PICKER_CONFIG: ResourcePickerConfig = {
    allowedRoles: ['Background'] as ResourceRole[],
    contentTypeHint: 'mixed',
    defaultUploadRole: 'Background' as ResourceRole,
    acceptedFileTypes: 'image/*,video/mp4,video/webm,video/ogg',
    title: 'Select Background',
    selectButtonLabel: 'Use Background',
};

/**
 * Configuration for selecting ambient sounds.
 */
export const AMBIENT_SOUND_PICKER_CONFIG: ResourcePickerConfig = {
    allowedRoles: ['AmbientSound', 'SoundEffect'] as ResourceRole[],
    contentTypeHint: 'audio',
    defaultUploadRole: 'AmbientSound' as ResourceRole,
    acceptedFileTypes: 'audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm',
    title: 'Select Sound',
    selectButtonLabel: 'Select Sound',
};
