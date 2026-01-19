// Stage Types - Frontend types matching Domain.Library.Stages.Model
// Stage is a first-class entity that owns structural/environmental elements
// Encounters reference a Stage and only contain game elements (actors, objects, effects)

import type { Point, Pole, SegmentType, SegmentState, LightSourceType, RegionType, GridType, Weather } from './domain';

// =============================================================================
// Stage Entity
// =============================================================================

export interface Stage {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    isPublished: boolean;
    isPublic: boolean;
    settings: StageSettings;
    grid: StageGrid;
    walls: StageWall[];
    regions: StageRegion[];
    lights: StageLight[];
    elements: StageElement[];
    sounds: StageSound[];
}

// =============================================================================
// Stage Settings (environment configuration)
// =============================================================================

export interface StageSettings {
    mainBackground?: ResourceMetadata | null;
    alternateBackground?: ResourceMetadata | null;
    useAlternateBackground: boolean;
    zoomLevel: number;
    panning: Point;
    ambientLight: AmbientLight;
    ambientSound?: ResourceMetadata | null;
    ambientSoundSource: AmbientSoundSource;
    ambientSoundVolume: number;
    ambientSoundLoop: boolean;
    ambientSoundIsPlaying: boolean;
    weather: Weather;
}

// Resource metadata for backgrounds and sounds
// NOTE: ProcessingStatus was removed - backend now handles placeholder/error fallback automatically
// The resource path always returns a valid image (primary, placeholder, or error-placeholder)
export interface ResourceMetadata {
    id: string;
    contentType: string;
    path: string;
    fileName: string;
    fileSize: number;
    dimensions: { width: number; height: number };
    duration: string;
    volume?: number;
}

// Ambient sound source (matches backend AmbientSoundSource enum)
// Backend uses JsonStringEnumConverter, so values are string names
export enum AmbientSoundSource {
    NotSet = 'NotSet',
    FromResource = 'FromResource',
    FromBackground = 'FromBackground',
}

// Ambient light levels (matches backend AmbientLight enum)
// Backend uses JsonStringEnumConverter, so values are string names
export enum AmbientLight {
    Black = 'Black',
    Darkness = 'Darkness',
    Nighttime = 'Nighttime',
    Dim = 'Dim',
    Twilight = 'Twilight',
    Default = 'Default',
    Candlelight = 'Candlelight',
    Torchlight = 'Torchlight',
    Artificial = 'Artificial',
    Daylight = 'Daylight',
    Bright = 'Bright',
}

// =============================================================================
// Stage Grid
// =============================================================================

export interface StageGrid {
    type: GridType;
    cellSize: CellSize;
    offset: GridOffset;
    scale: number;
}

export interface CellSize {
    width: number;
    height: number;
}

export interface GridOffset {
    left: number;
    top: number;
}

// =============================================================================
// Stage Structural Elements
// =============================================================================

// Walls
export interface StageWall {
    index: number;
    name?: string | undefined;
    segments: StageWallSegment[];
}

export interface StageWallSegment {
    index: number;
    name?: string | undefined;
    startPole: Pole;
    endPole: Pole;
    type: SegmentType;
    isOpaque: boolean;
    state: SegmentState;
}

// Regions
export interface StageRegion {
    index: number;
    name?: string | undefined;
    type: RegionType | string;
    vertices: StageRegionVertex[];
    value?: number | undefined;
}

export interface StageRegionVertex {
    x: number;
    y: number;
}

// Lights
export interface StageLight {
    index: number;
    name?: string | undefined;
    type: LightSourceType;
    position: Point;
    range: number;
    direction?: number | undefined;
    arc?: number | undefined;
    color?: string | undefined;
    isOn: boolean;
}

// Elements (decorations/props on the stage)
export interface StageElement {
    index: number;
    name?: string | undefined;
    display: ResourceMetadata;
    size: Dimension;
    position: Position;
    rotation: number;
    elevation: number;
    opacity: number;
}

export interface Dimension {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

// Sounds
export interface StageSound {
    index: number;
    name?: string | undefined;
    media: ResourceMetadata;
    position: Point;
    radius: number;
    volume: number;
    loop: boolean;
    isPlaying: boolean;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface CreateStageRequest {
    name: string;
    description?: string;
}

export interface UpdateStageRequest {
    name?: string | undefined;
    description?: string;
    isPublished?: boolean;
    isPublic?: boolean;
    settings?: UpdateStageSettingsRequest;
    grid?: UpdateStageGridRequest;
}

export interface UpdateStageSettingsRequest {
    mainBackgroundId?: string | null;
    alternateBackgroundId?: string | null;
    useAlternateBackground?: boolean;
    zoomLevel?: number;
    panning?: Point;
    ambientLight?: AmbientLight;
    ambientSoundId?: string | null;
    ambientSoundSource?: AmbientSoundSource;
    ambientSoundVolume?: number;
    ambientSoundLoop?: boolean;
    ambientSoundIsPlaying?: boolean;
    weather?: Weather;
}

export interface UpdateStageGridRequest {
    type?: GridType;
    cellSize?: CellSize;
    offset?: GridOffset;
    scale?: number;
}

// Structural element requests
export interface CreateWallRequest {
    name?: string | undefined;
    segments?: CreateWallSegmentRequest[];
}

export interface UpdateWallRequest {
    name?: string | undefined;
}

export interface CreateWallSegmentRequest {
    name?: string | undefined;
    startPole: Pole;
    endPole: Pole;
    type: SegmentType;
    isOpaque?: boolean;
    state?: SegmentState;
}

export interface UpdateWallSegmentRequest {
    name?: string | undefined;
    startPole?: Pole;
    endPole?: Pole;
    type?: SegmentType;
    isOpaque?: boolean;
    state?: SegmentState;
}

export interface CreateRegionRequest {
    name?: string | undefined;
    type: RegionType;
    vertices: StageRegionVertex[];
    value?: number;
}

export interface UpdateRegionRequest {
    name?: string | undefined;
    type?: RegionType;
    vertices?: StageRegionVertex[];
    value?: number;
}

export interface CreateLightRequest {
    name?: string | undefined;
    type: LightSourceType;
    position: Point;
    range: number;
    direction?: number | undefined;
    arc?: number | undefined;
    color?: string | undefined;
    isOn?: boolean;
}

export interface UpdateLightRequest {
    name?: string | undefined;
    type?: LightSourceType;
    position?: Point;
    range?: number;
    direction?: number | undefined;
    arc?: number | undefined;
    color?: string | undefined;
    isOn?: boolean;
}

export interface CreateElementRequest {
    name?: string | undefined;
    displayId: string;
    size?: Dimension;
    position?: Position;
    rotation?: number;
    elevation?: number;
    opacity?: number;
}

export interface UpdateElementRequest {
    name?: string | undefined;
    displayId?: string;
    size?: Dimension;
    position?: Position;
    rotation?: number;
    elevation?: number;
    opacity?: number;
}

export interface CreateSoundRequest {
    name?: string | undefined;
    mediaId: string;
    position?: Point;
    radius?: number;
    volume?: number;
    loop?: boolean;
    isPlaying?: boolean;
}

export interface UpdateSoundRequest {
    name?: string | undefined;
    mediaId?: string;
    position?: Point;
    radius?: number;
    volume?: number;
    loop?: boolean;
    isPlaying?: boolean;
}

// =============================================================================
// List/Summary Types
// =============================================================================

export interface StageListItem {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    isPublished: boolean;
    isPublic: boolean;
}
