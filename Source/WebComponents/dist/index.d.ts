import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { default as default_2 } from 'react';
import { EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { FetchArgs } from '@reduxjs/toolkit/query';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { JSX } from 'react/jsx-runtime';
import { MutationDefinition } from '@reduxjs/toolkit/query';
import { QueryDefinition } from '@reduxjs/toolkit/query';
import { ReactNode } from 'react';
import { RefObject } from 'react';
import { TypographyProps } from '@mui/material';

export declare interface AddResourceRequest {
    name: string;
    description: string;
    resourceType: ResourceType;
    filePath: string;
    fileSize: number;
    mimeType: string;
    tags?: string[];
}

export declare interface Adventure {
    id: string;
    type: ContentType;
    name: string;
    description: string;
    isPublished: boolean;
    ownerId: string;
    style?: AdventureStyle | null;
    isOneShot?: boolean | null;
    encounterCount?: number | null;
    background?: MediaResource | null;
    campaignId?: string;
    encounters?: Encounter[];
}

export declare function AdventureCard({ adventure, mediaBaseUrl, onOpen, onDuplicate, onDelete }: AdventureCardProps): JSX.Element;

export declare interface AdventureCardProps {
    adventure: Adventure;
    mediaBaseUrl: string;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export declare function AdventureDetailPage({ adventureId, adventure, campaign, encounters, isLoadingAdventure, isLoadingEncounters, adventureError, isUploading, isDeleting, mediaBaseUrl, onBack, onNavigateToCampaign, onUpdateAdventure, onUploadFile, onCreateEncounter, onCloneEncounter, onRemoveEncounter, onOpenEncounter, }: AdventureDetailPageProps): JSX.Element;

export declare interface AdventureDetailPageProps {
    adventureId: string;
    adventure: Adventure | null;
    campaign: Campaign | null;
    encounters: Encounter[];
    isLoadingAdventure: boolean;
    isLoadingEncounters: boolean;
    adventureError: unknown;
    isUploading: boolean;
    isDeleting: boolean;
    mediaBaseUrl: string;
    onBack: () => void;
    onNavigateToCampaign: (campaignId: string) => void;
    onUpdateAdventure: (request: {
        name?: string;
        description?: string;
        style?: AdventureStyle;
        isOneShot?: boolean;
        isPublished?: boolean;
        backgroundId?: string;
    }) => Promise<void>;
    onUploadFile: (file: File, type: string, resource: string, entityId: string) => Promise<{
        id: string;
    }>;
    onCreateEncounter: (request: {
        name: string;
        description: string;
        grid: {
            type: number;
            cellSize: {
                width: number;
                height: number;
            };
            offset: {
                left: number;
                top: number;
            };
            snap: boolean;
        };
    }) => Promise<{
        id: string;
    }>;
    onCloneEncounter: (encounterId: string) => Promise<void>;
    onRemoveEncounter: (encounterId: string) => Promise<void>;
    onOpenEncounter: (encounterId: string) => void;
}

export declare enum AdventureStyle {
    Generic = 0,
    OpenWorld = 1,
    DungeonCrawl = 2,
    HackNSlash = 3,
    Survival = 4,
    GoalDriven = 5,
    RandomlyGenerated = 6
}

export declare type AdventureTagType = (typeof adventureTagTypes)[number];

export declare const adventureTagTypes: readonly ["Adventure", "AdventureEncounters"];

export declare interface ApiClientConfig {
    baseUrl: string;
    getAuthToken?: () => string | null;
    getUserId?: () => string | null;
    onUnauthorized?: () => void;
}

export declare interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

export declare const applyAssetSnapshot: (asset: PlacedAsset, snapshot: PlacedAssetSnapshot) => PlacedAsset;

export declare interface Asset {
    id: string;
    classification: AssetClassification;
    name: string;
    description: string;
    portrait: MediaResource | null;
    tokenSize: NamedSize;
    tokens: MediaResource[];
    statBlocks: Record<number, Record<string, StatBlockValue>>;
    ownerId: string;
    isPublished: boolean;
    isPublic: boolean;
}

export declare const AssetCardCompact: default_2.FC<AssetCardCompactProps>;

export declare interface AssetCardCompactProps {
    asset: Asset;
    isSelected: boolean;
    isMultiSelectMode?: boolean;
    isChecked?: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
    onCheckChange?: (checked: boolean) => void;
    size: 'small' | 'large';
}

export declare interface AssetClassification {
    kind: AssetKind;
    category: string;
    type: string;
    subtype: string | null;
}

export declare const AssetInspectorPanel: default_2.FC<AssetInspectorPanelProps>;

export declare interface AssetInspectorPanelProps {
    asset: Asset;
    onEdit: () => void;
    onDelete: () => void;
}

export declare enum AssetKind {
    Character = "Character",
    Creature = "Creature",
    Effect = "Effect",
    Object = "Object"
}

export declare type AssetTagType = (typeof assetTagTypes)[number];

export declare const assetTagTypes: readonly ["Asset"];

export declare const AttributeRangeSlider: default_2.FC<AttributeRangeSliderProps>;

export declare interface AttributeRangeSliderProps {
    label: string;
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    formatValue?: (value: number) => string;
    debounceMs?: number;
}

export declare type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export declare interface BreakWallAction extends LocalAction {
    type: 'BREAK_WALL';
    segmentTempId: number;
    breakPoleIndex: number;
    originalPoles: Pole[];
    originalIsClosed: boolean;
    currentSegment1TempId: number;
    currentSegment2TempId: number;
    originalSegment1TempId: number;
    originalSegment2TempId: number;
    segment1Poles: Pole[];
    segment2Poles: Pole[];
}

export declare const BrowserToolbar: default_2.FC<BrowserToolbarProps>;

export declare interface BrowserToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortField: SortField;
    sortDirection: SortDirection;
    onSortChange: (field: SortField, direction: SortDirection) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    selectedCount: number;
    onBulkDelete?: () => void;
    onBulkPublish?: () => void;
    onBulkTags?: () => void;
    totalCount?: number;
}

export declare const calculateAssetSize: (namedSize: NamedSize | undefined, gridConfig: GridConfig) => {
    width: number;
    height: number;
};

export declare interface Campaign {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    isPublished: boolean;
    isPublic: boolean;
    worldId?: string;
    background?: MediaResource | null;
    adventures?: Adventure[];
}

export declare function CampaignCard({ campaign, mediaBaseUrl, onOpen, onDuplicate, onDelete }: CampaignCardProps): JSX.Element;

export declare interface CampaignCardProps {
    campaign: Campaign;
    mediaBaseUrl: string;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export declare function CampaignDetailPage({ campaignId, campaign, adventures, isLoadingCampaign, isLoadingAdventures, campaignError, isUploading, isDeleting, mediaBaseUrl, onBack, onUpdateCampaign, onUploadFile, onCreateAdventure, onCloneAdventure, onRemoveAdventure, onOpenAdventure, }: CampaignDetailPageProps): JSX.Element;

export declare interface CampaignDetailPageProps {
    campaignId: string;
    campaign: Campaign | null;
    adventures: Adventure[];
    isLoadingCampaign: boolean;
    isLoadingAdventures: boolean;
    campaignError: unknown;
    isUploading: boolean;
    isDeleting: boolean;
    mediaBaseUrl: string;
    onBack: () => void;
    onUpdateCampaign: (request: {
        name?: string;
        description?: string;
        isPublished?: boolean;
        backgroundId?: string;
    }) => Promise<void>;
    onUploadFile: (file: File, type: string, resource: string, entityId: string) => Promise<{
        id: string;
    }>;
    onCreateAdventure: (request: {
        name: string;
        description: string;
        style: number;
    }) => Promise<{
        id: string;
    }>;
    onCloneAdventure: (adventureId: string) => Promise<void>;
    onRemoveAdventure: (adventureId: string) => Promise<void>;
    onOpenAdventure: (adventureId: string) => void;
}

export declare type CampaignTagType = (typeof campaignTagTypes)[number];

export declare const campaignTagTypes: readonly ["Campaign", "CampaignAdventures"];

export declare interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export declare const checkAssetOverlap: (asset1: {
    x: number;
    y: number;
    width: number;
    height: number;
}, asset2: {
    x: number;
    y: number;
    width: number;
    height: number;
}) => boolean;

export declare function configureMediaUrls(config: MediaUrlConfig): void;

export declare function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, cancelText, severity, isLoading, }: ConfirmDialogProps): JSX.Element;

export declare interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'warning' | 'error' | 'info';
    isLoading?: boolean;
}

export declare function ContentCard({ item, onClick, actions, badges, metadata }: ContentCardProps): JSX.Element;

export declare interface ContentCardProps {
    item: ContentItemSummary;
    onClick: (id: string) => void;
    actions?: default_2.ReactNode;
    badges?: default_2.ReactNode;
    metadata?: default_2.ReactNode;
}

export declare function ContentEditorDialog({ open, onClose, onSave, title, contentTypeName, initialData, isLoading, showVisibility, }: ContentEditorDialogProps): JSX.Element;

export declare interface ContentEditorDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: ContentFormData) => Promise<void>;
    title: string;
    contentTypeName: string;
    initialData?: Partial<ContentFormData> | undefined;
    isLoading?: boolean | undefined;
    showVisibility?: boolean | undefined;
}

export declare interface ContentFormData {
    name: string;
    description: string;
    isPublished: boolean;
    isPublic: boolean;
}

export declare interface ContentItemSummary {
    id: string;
    type: ContentType;
    name: string;
    isPublished: boolean;
    thumbnailUrl?: string;
    metadata?: Record<string, unknown>;
}

export declare interface ContentListItem {
    id: string;
    type: ContentType;
    name: string;
    description: string;
    isPublished: boolean;
    ownerId: string;
    style?: AdventureStyle | null;
    isOneShot?: boolean | null;
    encounterCount?: number | null;
    background?: MediaResource | null;
}

export declare enum ContentType {
    Adventure = 0,
    Campaign = 1,
    World = 2
}

export declare const createAdventureEndpoints: (builder: EndpointBuilder<any, string, string>) => {
    getAdventures: QueryDefinition<void, any, string, Adventure[], string, any>;
    getAdventure: QueryDefinition<string, any, string, Adventure, string, any>;
    createAdventure: MutationDefinition<CreateAdventureRequest, any, string, Adventure, string, any>;
    updateAdventure: MutationDefinition<    {
    id: string;
    request: UpdateAdventureRequest;
    }, any, string, Adventure, string, any>;
    deleteAdventure: MutationDefinition<string, any, string, void, string, any>;
    cloneAdventure: MutationDefinition<    {
    id: string;
    name?: string;
    }, any, string, Adventure, string, any>;
    getEncounters: QueryDefinition<string, any, string, Encounter[], string, any>;
    createEncounter: MutationDefinition<    {
    adventureId: string;
    request: CreateEncounterRequest;
    }, any, string, Encounter, string, any>;
    cloneEncounter: MutationDefinition<    {
    adventureId: string;
    encounterId: string;
    name?: string;
    }, any, string, Encounter, string, any>;
    searchAdventures: QueryDefinition<    {
    query?: string;
    type?: string;
    tags?: string[];
    limit?: number;
    }, any, string, Adventure[], string, any>;
};

export declare interface CreateAdventureRequest {
    name: string;
    description: string;
    style: AdventureStyle;
    isOneShot?: boolean;
    campaignId?: string;
    backgroundId?: string;
}

export declare const createApiBaseQuery: (config: ApiClientConfig) => BaseQueryFn<string | FetchArgs, unknown, EnhancedError>;

export declare const createAssetEndpoints: (builder: EndpointBuilder<any, string, string>) => {
    getAssets: QueryDefinition<    {
    kind?: AssetKind;
    search?: string;
    published?: boolean;
    owner?: "mine" | "public" | "all";
    }, any, string, Asset[], string, any>;
    getAssetsPaged: QueryDefinition<    {
    kind?: AssetKind;
    search?: string;
    published?: boolean;
    owner?: "mine" | "public" | "all";
    page: number;
    pageSize: number;
    }, any, string, {
    data: Asset[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    }, string, any>;
    getAsset: QueryDefinition<string, any, string, Asset, string, any>;
    createAsset: MutationDefinition<CreateAssetRequest, any, string, Asset, string, any>;
    updateAsset: MutationDefinition<    {
    id: string;
    request: UpdateAssetRequest;
    }, any, string, void, string, any>;
    deleteAsset: MutationDefinition<string, any, string, void, string, any>;
};

export declare interface CreateAssetRequest {
    kind: AssetKind;
    category: string;
    type: string;
    subtype?: string;
    name: string;
    description: string;
    tags?: string[];
    portraitId?: string;
    tokenSize?: NamedSize;
    tokenId?: string;
}

export declare const createAssetSnapshot: (asset: PlacedAsset) => PlacedAssetSnapshot;

export declare function createBreakWallAction(segmentTempId: number, breakPoleIndex: number, originalPoles: Pole[], originalIsClosed: boolean, originalWallIndex: number, newSegment1TempId: number, newSegment2TempId: number, segment1Poles: Pole[], segment2Poles: Pole[], wallName: string, wallVisibility: WallVisibility, wallColor: string | undefined, onRemoveSegment: (tempId: number) => void, onUpdateSegment: (tempId: number, changes: {
    wallIndex: number;
    poles: Pole[];
    isClosed: boolean;
}) => void, onAddSegment: (segment: {
    wallIndex: number | null;
    name: string;
    poles: Pole[];
    isClosed: boolean;
    visibility: WallVisibility;
    color: string | undefined;
}) => number): BreakWallAction;

export declare const createCampaignEndpoints: (builder: EndpointBuilder<any, string, string>) => {
    getCampaigns: QueryDefinition<void, any, string, Campaign[], string, any>;
    getCampaign: QueryDefinition<string, any, string, Campaign, string, any>;
    createCampaign: MutationDefinition<CreateCampaignRequest, any, string, Campaign, string, any>;
    updateCampaign: MutationDefinition<    {
    id: string;
    request: UpdateCampaignRequest;
    }, any, string, Campaign, string, any>;
    deleteCampaign: MutationDefinition<string, any, string, void, string, any>;
    cloneCampaign: MutationDefinition<    {
    id: string;
    name?: string;
    }, any, string, Campaign, string, any>;
    getAdventures: QueryDefinition<string, any, string, Adventure[], string, any>;
    createAdventure: MutationDefinition<    {
    campaignId: string;
    request: CreateAdventureRequest;
    }, any, string, Adventure, string, any>;
    cloneAdventure: MutationDefinition<    {
    campaignId: string;
    adventureId: string;
    name?: string;
    }, any, string, Adventure, string, any>;
    removeAdventure: MutationDefinition<    {
    campaignId: string;
    adventureId: string;
    }, any, string, void, string, any>;
};

export declare interface CreateCampaignRequest {
    name: string;
    description: string;
    backgroundId?: string;
}

export declare function createDeletePoleAction(poleIndices: number[], poles: Pole[], onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): DeletePoleAction;

export declare function createDeleteVertexAction(deletedIndex: number, deletedVertex: Point, _getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): DeleteVertexAction;

export declare const createEncounterEndpoints: (builder: EndpointBuilder<any, string, string>) => {
    getEncounter: QueryDefinition<string, any, string, Encounter, string, any>;
    getEncounters: QueryDefinition<    {
    adventureId?: string;
    }, any, string, Encounter[], string, any>;
    createEncounter: MutationDefinition<CreateEncounterRequest, any, string, Encounter, string, any>;
    updateEncounter: MutationDefinition<UpdateEncounterWithVersionRequest, any, string, Encounter, string, any>;
    patchEncounter: MutationDefinition<    {
    id: string;
    request: UpdateEncounterRequest;
    }, any, string, Encounter, string, any>;
    deleteEncounter: MutationDefinition<string, any, string, void, string, any>;
    addEncounterAsset: MutationDefinition<    {
    encounterId: string;
    libraryAssetId: string;
    position: {
    x: number;
    y: number;
    };
    size: {
    width: number;
    height: number;
    };
    rotation?: number;
    tokenId?: string;
    portraitId?: string;
    notes?: string;
    isVisible?: boolean;
    }, any, string, void, string, any>;
    updateEncounterAsset: MutationDefinition<    {
    encounterId: string;
    assetNumber: number;
    position?: {
    x: number;
    y: number;
    };
    size?: {
    width: number;
    height: number;
    };
    rotation?: number;
    name?: string;
    tokenId?: string;
    portraitId?: string;
    notes?: string;
    visible?: boolean;
    locked?: boolean;
    }, any, string, void, string, any>;
    bulkUpdateEncounterAssets: MutationDefinition<    {
    encounterId: string;
    updates: EncounterAssetBulkUpdate[];
    }, any, string, void, string, any>;
    removeEncounterAsset: MutationDefinition<    {
    encounterId: string;
    assetNumber: number;
    }, any, string, void, string, any>;
    bulkDeleteEncounterAssets: MutationDefinition<    {
    encounterId: string;
    assetIndices: number[];
    }, any, string, void, string, any>;
    bulkAddEncounterAssets: MutationDefinition<    {
    encounterId: string;
    assets: Array<{
    assetId: string;
    position: {
    x: number;
    y: number;
    };
    size: {
    width: number;
    height: number;
    };
    rotation?: number;
    elevation?: number;
    tokenId?: string;
    portraitId?: string;
    name?: string;
    notes?: string;
    isVisible?: boolean;
    }>;
    }, any, string, void, string, any>;
    getEncounterWalls: QueryDefinition<string, any, string, EncounterWall[], string, any>;
    addEncounterWall: MutationDefinition<    {
    encounterId: string;
    name: string | undefined;
    poles: Pole[] | undefined;
    visibility: WallVisibility | undefined;
    isClosed: boolean | undefined;
    color?: string | undefined;
    }, any, string, EncounterWall, string, any>;
    updateEncounterWall: MutationDefinition<    {
    encounterId: string;
    wallIndex: number;
    name?: string | undefined;
    poles?: Pole[] | undefined;
    visibility?: WallVisibility | undefined;
    isClosed?: boolean | undefined;
    color?: string | undefined;
    }, any, string, void, string, any>;
    removeEncounterWall: MutationDefinition<    {
    encounterId: string;
    wallIndex: number;
    }, any, string, void, string, any>;
    getEncounterRegions: QueryDefinition<string, any, string, EncounterRegion[], string, any>;
    addEncounterRegion: MutationDefinition<    {
    encounterId: string;
    name: string;
    type: string;
    vertices: Point[];
    value?: number;
    label?: string;
    color?: string;
    }, any, string, EncounterRegion, string, any>;
    updateEncounterRegion: MutationDefinition<    {
    encounterId: string;
    regionIndex: number;
    name?: string;
    type?: string;
    vertices?: Point[];
    value?: number;
    label?: string;
    color?: string;
    }, any, string, void, string, any>;
    removeEncounterRegion: MutationDefinition<    {
    encounterId: string;
    regionIndex: number;
    }, any, string, void, string, any>;
    getEncounterSources: QueryDefinition<string, any, string, EncounterSource[], string, any>;
    addEncounterSource: MutationDefinition<    {
    encounterId: string;
    name: string;
    type: string;
    position: Point;
    isDirectional: boolean;
    direction: number;
    spread: number;
    range?: number;
    intensity?: number;
    color?: string;
    hasGradient: boolean;
    }, any, string, EncounterSource, string, any>;
    updateEncounterSource: MutationDefinition<    {
    encounterId: string;
    sourceIndex: number;
    name?: string;
    type?: string;
    position?: Point;
    isDirectional?: boolean;
    direction?: number;
    spread?: number;
    range?: number;
    intensity?: number;
    color?: string;
    hasGradient?: boolean;
    }, any, string, void, string, any>;
    removeEncounterSource: MutationDefinition<    {
    encounterId: string;
    sourceIndex: number;
    }, any, string, void, string, any>;
    addEncounterOpening: MutationDefinition<    {
    encounterId: string;
    name?: string;
    description?: string;
    type: string;
    wallIndex: number;
    centerPosition: number;
    width: number;
    height: number;
    visibility?: OpeningVisibility;
    state?: OpeningState;
    opacity?: OpeningOpacity;
    material?: string;
    color?: string;
    }, any, string, EncounterOpening, string, any>;
    updateEncounterOpening: MutationDefinition<    {
    encounterId: string;
    openingIndex: number;
    name?: string;
    description?: string;
    type?: string;
    width?: number;
    height?: number;
    visibility?: OpeningVisibility;
    state?: OpeningState;
    opacity?: OpeningOpacity;
    material?: string;
    color?: string;
    }, any, string, void, string, any>;
    removeEncounterOpening: MutationDefinition<    {
    encounterId: string;
    openingIndex: number;
    }, any, string, void, string, any>;
};

export declare interface CreateEncounterRequest {
    name: string;
    description: string;
    backgroundId?: string;
    grid?: {
        type: number;
        cellSize: {
            width: number;
            height: number;
        };
        offset: {
            left: number;
            top: number;
        };
        snap: boolean;
    };
}

export declare interface CreateGameSessionRequest {
    adventureId: string;
    name: string;
    maxPlayers: number;
    isPrivate: boolean;
}

export declare function createInsertPoleAction(poleIndex: number, pole: Pole, onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): InsertPoleAction;

export declare function createInsertVertexAction(insertIndex: number, vertex: Point, _getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): InsertVertexAction;

export declare function createMoveLineAction(pole1Index: number, pole2Index: number, oldPole1: {
    x: number;
    y: number;
    h: number;
}, oldPole2: {
    x: number;
    y: number;
    h: number;
}, newPole1: {
    x: number;
    y: number;
    h: number;
}, newPole2: {
    x: number;
    y: number;
    h: number;
}, onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): MoveLineAction;

export declare function createMovePoleAction(poleIndex: number, oldPosition: {
    x: number;
    y: number;
}, newPosition: {
    x: number;
    y: number;
}, onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): MovePoleAction;

export declare function createMoveVertexAction(vertexIndex: number, oldVertex: Point, newVertex: Point, _getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): MoveVertexAction;

export declare function createMultiMovePoleAction(moves: Array<{
    poleIndex: number;
    oldPosition: {
        x: number;
        y: number;
    };
    newPosition: {
        x: number;
        y: number;
    };
}>, onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): MultiMovePoleAction;

export declare function createMultiMoveVertexAction(vertexIndices: number[], oldVertices: Point[], newVertices: Point[], _getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): MultiMoveVertexAction;

export declare function createPlacePoleAction(poleIndex: number, pole: Pole, onPolesChange: (poles: Pole[], isClosed?: boolean) => void, getCurrentPoles: () => Pole[], getCurrentIsClosed: () => boolean): PlacePoleAction;

export declare function createPlaceVertexAction(_getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): PlaceVertexAction;

export declare function createRegionMoveLineAction(lineIndex: number, oldVertex1: Point, oldVertex2: Point, newVertex1: Point, newVertex2: Point, _getSegment: () => RegionSegment | null, setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void): RegionMoveLineAction;

export declare const createWorldEndpoints: (builder: EndpointBuilder<any, string, string>) => {
    getWorlds: QueryDefinition<void, any, string, World[], string, any>;
    getWorld: QueryDefinition<string, any, string, World, string, any>;
    createWorld: MutationDefinition<CreateWorldRequest, any, string, World, string, any>;
    updateWorld: MutationDefinition<    {
    id: string;
    request: UpdateWorldRequest;
    }, any, string, World, string, any>;
    deleteWorld: MutationDefinition<string, any, string, void, string, any>;
    cloneWorld: MutationDefinition<    {
    id: string;
    name?: string;
    }, any, string, World, string, any>;
    getCampaigns: QueryDefinition<string, any, string, Campaign[], string, any>;
    createCampaign: MutationDefinition<    {
    worldId: string;
    request: CreateCampaignRequest;
    }, any, string, Campaign, string, any>;
    cloneCampaign: MutationDefinition<    {
    worldId: string;
    campaignId: string;
    name?: string;
    }, any, string, Campaign, string, any>;
    removeCampaign: MutationDefinition<    {
    worldId: string;
    campaignId: string;
    }, any, string, void, string, any>;
};

export declare interface CreateWorldRequest {
    name: string;
    description: string;
    backgroundId?: string;
}

export declare interface DeletePoleAction extends LocalAction {
    type: 'DELETE_POLE';
    poleIndices: number[];
    poles: Pole[];
}

export declare interface DeleteVertexAction extends RegionLocalAction {
    type: 'DELETE_VERTEX';
    deletedIndex: number;
    deletedVertex: Point;
}

export declare const DisplayPreview: default_2.FC<DisplayPreviewProps>;

export declare interface DisplayPreviewProps {
    imageUrl: string;
    maxSize?: number;
    alt?: string;
}

export declare function EditableTitle({ value, onSave, placeholder, maxLength, variant, disabled, 'aria-label': ariaLabel, id, }: EditableTitleProps): JSX.Element;

export declare interface EditableTitleProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    placeholder?: string;
    maxLength?: number;
    variant?: TypographyProps['variant'];
    disabled?: boolean;
    'aria-label'?: string;
    id?: string;
}

export declare const EditingBlocker: default_2.FC<EditingBlockerProps>;

export declare interface EditingBlockerProps {
    isBlocked: boolean;
}

export declare interface Encounter {
    id: string;
    adventure: Adventure | null;
    name: string;
    description: string;
    isPublished: boolean;
    light: Light;
    weather: Weather;
    elevation: number;
    grid: {
        type: number;
        cellSize: {
            width: number;
            height: number;
        };
        offset: {
            left: number;
            top: number;
        };
        snap: boolean;
    };
    stage: {
        background: MediaResource | null;
        zoomLevel: number;
        panning: {
            x: number;
            y: number;
        };
    };
    assets: EncounterAsset[];
    walls: EncounterWall[];
    openings: EncounterOpening[];
    regions: EncounterRegion[];
    sources: EncounterSource[];
}

export declare interface EncounterAsset {
    id: string;
    encounterId: string;
    assetId: string;
    index: number;
    number: number;
    name: string;
    notes?: string;
    image?: MediaResource;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    layer: number;
    elevation: number;
    visible: boolean;
    locked: boolean;
    asset: Asset;
    customBehavior?: Partial<PlacementBehavior>;
}

export declare interface EncounterAssetBulkUpdate {
    index: number;
    position?: {
        x: number;
        y: number;
    };
    size?: {
        width: number;
        height: number;
    };
    rotation?: number;
    elevation?: number;
}

export declare interface EncounterAssetData {
    assetId: string;
    index: number;
    number: number;
    name: string;
    description: string | null;
    resourceId: string;
    size: {
        width: number;
        height: number;
    };
    position: Point_2;
    rotation: number;
    frame: Frame | null;
    elevation: number;
    isLocked: boolean;
    isVisible: boolean;
    controlledBy: string | null;
}

export declare function EncounterCard({ encounter, mediaBaseUrl, onOpen, onDuplicate, onDelete }: EncounterCardProps): JSX.Element;

export declare interface EncounterCardProps {
    encounter: Encounter;
    mediaBaseUrl: string;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export declare interface EncounterListItem {
    id: string;
    name: string;
    description: string;
    isPublished: boolean;
    ownerId: string;
    adventureId: string | null;
    grid: GridConfig;
    stage: StageConfig;
    assets: EncounterAssetData[];
}

export declare interface EncounterMetadata {
    gridType: string;
    assetCount: number;
    lastModified: string;
}

export declare interface EncounterOpening {
    encounterId: string;
    index: number;
    name: string;
    description?: string;
    type: string;
    wallIndex: number;
    startPoleIndex: number;
    endPoleIndex: number;
    height: number;
    visibility: OpeningVisibility;
    state: OpeningState;
    opacity: OpeningOpacity;
}

export declare interface EncounterRegion {
    encounterId: string;
    index: number;
    name: string;
    type: string;
    vertices: Point[];
    value?: number;
    label?: string;
    color?: string;
}

export declare interface EncounterSource {
    encounterId: string;
    index: number;
    name: string;
    type: string;
    position: Point;
    isDirectional: boolean;
    direction: number;
    spread: number;
    range?: number;
    intensity?: number;
    color?: string;
    hasGradient: boolean;
}

export declare interface EncounterStructure {
    id: string;
    encounterId: string;
    structureId: string;
    vertices: Array<{
        x: number;
        y: number;
    }>;
    isOpen?: boolean;
    isLocked?: boolean;
    isSecret?: boolean;
}

export declare type EncounterTagType = (typeof encounterTagTypes)[number];

export declare const encounterTagTypes: readonly ["Encounter", "EncounterAsset", "EncounterWall", "EncounterOpening", "EncounterRegion", "EncounterSource"];

export declare interface EncounterWall {
    encounterId: string;
    index: number;
    name: string;
    poles: Pole[];
    visibility: WallVisibility;
    isClosed: boolean;
}

export declare interface EnhancedError {
    status: FetchBaseQueryError['status'];
    data?: unknown;
    error?: string;
    isNetworkError?: boolean;
}

export declare interface ExternalLoginCallbackRequest {
    provider: string;
    returnUrl?: string;
}

export declare interface ExternalLoginInfo {
    provider: string;
    providerDisplayName: string;
    loginUrl: string;
}

export declare interface ForgotPasswordRequest {
    email: string;
}

export declare interface Frame {
    shape: string;
    borderColor: string;
    borderThickness: number;
    background: string;
}

export declare interface GameSession {
    id: string;
    adventureId: string;
    name: string;
    maxPlayers: number;
    currentPlayers: number;
    isPrivate: boolean;
    status: GameSessionStatus;
    createdAt: string;
    updatedAt: string;
    adventure: Adventure;
}

export declare enum GameSessionStatus {
    Waiting = "Waiting",
    InProgress = "InProgress",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

export declare function getDefaultAssetImage(asset: Asset): MediaResource | null;

export declare const getDefaultGrid: () => GridConfig;

export declare const getDefaultStage: () => StageConfig;

export declare const getPlacementBehavior: (assetKind: AssetKind, objectData?: {
    size: NamedSize;
    isMovable: boolean;
    isOpaque: boolean;
}, monsterOrCharacterData?: {
    size: NamedSize;
}) => PlacementBehavior;

export declare function getResourceUrl(resourceId: string): string;

export declare interface GridConfig {
    type: number;
    cellSize: {
        width: number;
        height: number;
    };
    offset: {
        left: number;
        top: number;
    };
    snap: boolean;
}

export declare enum GridType {
    NoGrid = "NoGrid",
    Square = "Square",
    HexV = "HexV",
    HexH = "HexH",
    Isometric = "Isometric"
}

export declare interface InsertPoleAction extends LocalAction {
    type: 'INSERT_POLE';
    poleIndex: number;
    pole: Pole;
}

export declare interface InsertVertexAction extends RegionLocalAction {
    type: 'INSERT_VERTEX';
    insertIndex: number;
    vertex: Point;
}

export declare interface JoinGameSessionRequest {
    sessionId: string;
    playerName: string;
}

export declare enum LabelPosition {
    Default = "Default",
    Top = "Top",
    Middle = "Middle",
    Bottom = "Bottom"
}

export declare enum LabelVisibility {
    Default = "Default",
    Always = "Always",
    OnHover = "OnHover",
    Never = "Never"
}

export declare interface LibraryContextValue {
    masterUserId: string | null;
    isAdminMode: boolean;
    currentUserId: string;
    canEdit: (ownerId: string) => boolean;
    canDelete: (ownerId: string) => boolean;
    canModerate: (ownerId: string) => boolean;
    canTransferOwnership: (ownerId: string) => boolean;
}

export declare const LibraryProvider: ({ children, masterUserId, currentUserId, isAdminMode, }: LibraryProviderProps) => JSX.Element;

export declare interface LibraryProviderProps {
    children: ReactNode;
    masterUserId: string | null;
    currentUserId: string;
    isAdminMode?: boolean;
}

export declare enum Light {
    Black = -10,
    Darkness = -5,
    Nighttime = -3,
    Dim = -2,
    Twilight = -1,
    Ambient = 0,
    Candlelight = 1,
    Torchlight = 2,
    Artificial = 3,
    Daylight = 5,
    Bright = 10
}

export declare interface LinkExternalLoginRequest {
    provider: string;
}

export declare const LoadingOverlay: default_2.FC<LoadingOverlayProps>;

declare interface LoadingOverlayProps {
    open: boolean;
    message?: string;
    backdropOpacity?: number;
    size?: number;
}

export declare interface LocalAction {
    type: string;
    description: string;
    undo: () => void;
    redo: () => void;
}

export declare interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export declare interface LoginResponse {
    success: boolean;
    requiresTwoFactor?: boolean;
    redirectUrl?: string;
    message?: string;
    user?: User;
    token?: string;
}

export declare interface MediaResource {
    id: string;
    description: string | null;
    features: Record<string, string[]>;
    type: ResourceType;
    path: string;
    contentType: string;
    fileName: string;
    fileLength: number;
    size: {
        width: number;
        height: number;
    };
    duration: string;
    ownerId: string;
    isPublished: boolean;
    isPublic: boolean;
}

export declare interface MediaUrlConfig {
    mediaBaseUrl: string;
}

export declare interface MoveLineAction extends LocalAction {
    type: 'MOVE_LINE';
    pole1Index: number;
    pole2Index: number;
    oldPole1: {
        x: number;
        y: number;
    };
    oldPole2: {
        x: number;
        y: number;
    };
    newPole1: {
        x: number;
        y: number;
    };
    newPole2: {
        x: number;
        y: number;
    };
}

export declare interface MovePoleAction extends LocalAction {
    type: 'MOVE_POLE';
    poleIndex: number;
    oldPosition: {
        x: number;
        y: number;
    };
    newPosition: {
        x: number;
        y: number;
    };
}

export declare interface MoveVertexAction extends RegionLocalAction {
    type: 'MOVE_VERTEX';
    vertexIndex: number;
    oldVertex: Point;
    newVertex: Point;
}

export declare interface MultiMovePoleAction extends LocalAction {
    type: 'MULTI_MOVE_POLE';
    moves: Array<{
        poleIndex: number;
        oldPosition: {
            x: number;
            y: number;
        };
        newPosition: {
            x: number;
            y: number;
        };
    }>;
}

export declare interface MultiMoveVertexAction extends RegionLocalAction {
    type: 'MULTI_MOVE_VERTEX';
    moves: Array<{
        vertexIndex: number;
        oldVertex: Point;
        newVertex: Point;
    }>;
}

export declare interface NamedSize {
    width: number;
    height: number;
}

export declare enum OpeningOpacity {
    Opaque = 0,
    Translucent = 1,
    Transparent = 2,
    Ethereal = 3
}

export declare enum OpeningState {
    Open = 0,
    Closed = 1,
    Locked = 2,
    Barred = 3,
    Destroyed = 4,
    Jammed = 5
}

export declare enum OpeningVisibility {
    Visible = 0,
    Secret = 1,
    Concealed = 2
}

export declare interface PlacedAsset {
    id: string;
    assetId: string;
    asset: Asset;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    rotation: number;
    layer: string;
    index: number;
    number: number;
    name: string;
    visible: boolean;
    locked: boolean;
    labelVisibility: LabelVisibility;
    labelPosition: LabelPosition;
}

export declare interface PlacedAssetSnapshot {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    rotation: number;
    layer: string;
}

export declare interface PlacedOpening extends EncounterOpening {
    id: string;
}

export declare interface PlacedRegion extends EncounterRegion {
    id: string;
}

export declare interface PlacedSource extends EncounterSource {
    id: string;
}

export declare interface PlacedWall extends EncounterWall {
    id: string;
}

export declare interface PlacementBehavior {
    canMove: boolean;
    canRotate: boolean;
    canResize: boolean;
    canDelete: boolean;
    canDuplicate: boolean;
    snapMode: SnapMode;
    snapToGrid: boolean;
    requiresGridAlignment: boolean;
    allowOverlap: boolean;
    minSize: {
        width: number;
        height: number;
    };
    maxSize: {
        width: number;
        height: number;
    };
    lockAspectRatio: boolean;
    allowElevation: boolean;
    zIndexRange: [number, number];
}

export declare interface PlacePoleAction extends LocalAction {
    type: 'PLACE_POLE';
    poleIndex: number;
    pole: Pole;
}

export declare interface PlaceVertexAction extends RegionLocalAction {
    type: 'PLACE_VERTEX';
    vertexIndex: number;
    vertex: Point;
}

export declare interface Point {
    x: number;
    y: number;
}

declare interface Point_2 {
    x: number;
    y: number;
}

export declare interface Pole {
    x: number;
    y: number;
    h: number;
}

export declare function PublishedBadge(): JSX.Element;

export declare interface RegionLocalAction {
    type: string;
    description: string;
    undo: () => void;
    redo: () => void;
}

export declare interface RegionMoveLineAction extends RegionLocalAction {
    type: 'MOVE_LINE';
    lineIndex: number;
    vertex1Index: number;
    vertex2Index: number;
    oldVertex1: Point;
    oldVertex2: Point;
    newVertex1: Point;
    newVertex2: Point;
}

export declare interface RegionSegment {
    regionIndex: number | null;
    name: string;
    type: string;
    vertices: Point[];
    value?: number;
    label?: string;
    color?: string;
}

export declare interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    displayName: string;
}

export declare interface RegisterResponse {
    success: boolean;
    message?: string;
    errors?: string[];
}

export declare interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export declare enum ResourceType {
    Image = "Image",
    Audio = "Audio",
    Video = "Video",
    Document = "Document"
}

export declare type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export declare const SaveStatusIndicator: default_2.FC<SaveStatusIndicatorProps>;

declare interface SaveStatusIndicatorProps {
    status: SaveStatus;
    compact?: boolean;
}

export declare enum SizeName {
    Zero = 0,
    Miniscule = 1,
    Tiny = 2,
    Small = 3,
    Medium = 4,
    Large = 5,
    Huge = 6,
    Gargantuan = 7,
    Custom = 99
}

export declare const SizeSelector: default_2.FC<SizeSelectorProps>;

export declare interface SizeSelectorProps {
    value: NamedSize;
    onChange: (size: NamedSize) => void;
    label?: string;
    readOnly?: boolean;
}

export declare const snapAssetPosition: (position: {
    x: number;
    y: number;
}, size: {
    width: number;
    height: number;
}, behavior: PlacementBehavior, gridConfig: GridConfig) => {
    x: number;
    y: number;
};

export declare type SnapMode = 'grid' | 'free' | 'edge' | 'corner';

export declare const snapToGrid: (position: {
    x: number;
    y: number;
}, _gridConfig: GridConfig) => {
    x: number;
    y: number;
};

export declare type SortDirection = 'asc' | 'desc';

export declare type SortField = 'name' | 'category' | 'type' | 'createdAt';

export declare interface StageConfig {
    background: MediaResource | null;
    zoomLevel: number;
    panning: Point_2;
}

export declare interface StatBlock {
    id: string;
    name: string;
    createdAt: string;
}

export declare interface StatBlockValue {
    key: string;
    value: string | null;
    type: StatValueType;
}

export declare enum StatValueType {
    Number = "Number",
    Text = "Text",
    Modifier = "Modifier"
}

export declare interface Structure {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    isBlocking: boolean;
    isOpaque: boolean;
    isSecret: boolean;
    isOpenable: boolean;
    isLocked: boolean;
    visual?: MediaResource;
    createdAt: string;
}

export declare const TaxonomyTree: default_2.FC<TaxonomyTreeProps>;

export declare interface TaxonomyTreeProps {
    assets: Asset[];
    selectedPath: string[];
    onPathChange: (path: string[]) => void;
    expandedNodes: string[];
    onExpandedChange: (nodes: string[]) => void;
}

export declare const TokenCarousel: default_2.FC<TokenCarouselProps>;

export declare interface TokenCarouselProps {
    tokens: MediaResource[];
    selectedIndex?: number;
    onSelect?: (index: number) => void;
    size?: 'small' | 'medium';
    showNavigation?: boolean;
}

export declare const TokenPreview: default_2.FC<TokenPreviewProps>;

export declare interface TokenPreviewProps {
    imageUrl: string;
    size: NamedSize;
    maxSize?: number;
}

export declare interface TwoFactorRecoveryRequest {
    recoveryCode: string;
}

export declare interface TwoFactorSetupResponse {
    sharedKey: string;
    authenticatorUri: string;
    qrCodeUri: string;
    recoveryCodes: string[];
}

export declare interface TwoFactorVerificationRequest {
    code: string;
    rememberMachine?: boolean;
}

export declare interface UpdateAdventureRequest {
    name?: string;
    description?: string;
    style?: AdventureStyle;
    isOneShot?: boolean;
    campaignId?: string;
    backgroundId?: string;
}

export declare interface UpdateAssetRequest {
    kind?: AssetKind;
    category?: string;
    type?: string;
    subtype?: string | null;
    name?: string;
    description?: string;
    tags?: {
        add?: string[];
        remove?: string[];
    };
    portraitId?: string | null;
    tokenSize?: NamedSize;
    isPublished?: boolean;
    isPublic?: boolean;
}

export declare interface UpdateCampaignRequest {
    name?: string;
    description?: string;
    backgroundId?: string;
    isPublished?: boolean;
    isPublic?: boolean;
}

export declare interface UpdateEncounterRequest {
    name?: string;
    description?: string;
    backgroundId?: string;
    grid?: {
        type: number;
        cellSize: {
            width: number;
            height: number;
        };
        offset: {
            left: number;
            top: number;
        };
        snap: boolean;
    };
}

export declare interface UpdateEncounterWithVersionRequest extends UpdateEncounterRequest {
    id: string;
    version: number;
}

export declare interface UpdateGameSessionRequest {
    name?: string;
    maxPlayers?: number;
    isPrivate?: boolean;
    status?: GameSessionStatus;
}

export declare interface UpdateProfileRequest {
    name?: string;
    displayName?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
}

export declare interface UpdateResourceRequest {
    name?: string;
    description?: string;
    tags?: string[];
}

export declare interface UpdateWorldRequest {
    name?: string;
    description?: string;
    backgroundId?: string;
    isPublished?: boolean;
    isPublic?: boolean;
}

export declare interface UploadRequest {
    fileName: string;
    contentType: string;
    fileSize: number;
    tags?: string[];
}

export declare function useAutoSave<T>({ data, originalData, onSave, delay, enabled }: UseAutoSaveOptions<T>): AutoSaveStatus;

export declare interface UseAutoSaveOptions<T> {
    data: T;
    originalData: T;
    onSave: (data: T) => Promise<void>;
    delay?: number;
    enabled?: boolean;
}

export declare function useDebounce<T>(value: T, delay?: number): T;

export declare function useInfiniteScroll({ hasMore, isLoading, onLoadMore, threshold }: UseInfiniteScrollOptions): {
    sentinelRef: RefObject<HTMLDivElement | null>;
};

export declare interface UseInfiniteScrollOptions {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    threshold?: number;
}

export declare const useLibrary: () => LibraryContextValue;

export declare const useLibraryOptional: () => LibraryContextValue | null;

export declare interface User {
    id: string;
    email: string;
    userName?: string;
    name: string;
    displayName: string;
    emailConfirmed: boolean;
    phoneNumber?: string;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnd?: string;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    createdAt: string;
    lastLoginAt?: string;
    profilePictureUrl?: string;
}

export declare const validatePlacement: (position: {
    x: number;
    y: number;
}, size: {
    width: number;
    height: number;
}, behavior: PlacementBehavior, existingAssets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    allowOverlap: boolean;
}>, gridConfig: GridConfig, skipCollisionCheck?: boolean) => {
    valid: boolean;
    errors: string[];
};

export declare interface VersionConflictError {
    message: string;
    serverVersion: number;
    clientVersion: number;
    conflictType: 'version_mismatch';
}

export declare type ViewMode = 'grid-large' | 'grid-small' | 'table';

export declare enum WallVisibility {
    Normal = 0,
    Fence = 1,
    Invisible = 2,
    Veil = 3
}

export declare enum Weather {
    Clear = "Clear",
    PartlyCloudy = "PartlyCloudy",
    Overcast = "Overcast",
    Fog = "Fog",
    LightRain = "LightRain",
    Rain = "Rain",
    HeavyRain = "HeavyRain",
    Rainstorm = "Rainstorm",
    Thunderstorm = "Thunderstorm",
    LightSnow = "LightSnow",
    Snow = "Snow",
    HeavySnow = "HeavySnow",
    Snowstorm = "Snowstorm",
    Hail = "Hail",
    IceStorm = "IceStorm",
    Breezy = "Breezy",
    Windy = "Windy",
    Hurricane = "Hurricane",
    Tornado = "Tornado",
    FireStorm = "FireStorm"
}

export declare interface World {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    isPublished: boolean;
    isPublic: boolean;
    background?: MediaResource | null;
    campaigns?: Campaign[];
}

export declare function WorldCard({ world, mediaBaseUrl, onOpen, onDuplicate, onDelete }: WorldCardProps): JSX.Element;

export declare interface WorldCardProps {
    world: World;
    mediaBaseUrl: string;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export declare function WorldDetailPage({ worldId, world, campaigns, isLoadingWorld, isLoadingCampaigns, worldError, isUploading, isDeleting, mediaBaseUrl, onBack, onUpdateWorld, onUploadFile, onCreateCampaign, onCloneCampaign, onRemoveCampaign, onOpenCampaign, }: WorldDetailPageProps): JSX.Element;

export declare interface WorldDetailPageProps {
    worldId: string;
    world: World | null;
    campaigns: Campaign[];
    isLoadingWorld: boolean;
    isLoadingCampaigns: boolean;
    worldError: unknown;
    isUploading: boolean;
    isDeleting: boolean;
    mediaBaseUrl: string;
    onBack: () => void;
    onUpdateWorld: (request: {
        name?: string;
        description?: string;
        isPublished?: boolean;
        backgroundId?: string;
    }) => Promise<void>;
    onUploadFile: (file: File, type: string, resource: string, entityId: string) => Promise<{
        id: string;
    }>;
    onCreateCampaign: (request: {
        name: string;
        description: string;
    }) => Promise<{
        id: string;
    }>;
    onCloneCampaign: (campaignId: string) => Promise<void>;
    onRemoveCampaign: (campaignId: string) => Promise<void>;
    onOpenCampaign: (campaignId: string) => void;
}

export declare type WorldTagType = (typeof worldTagTypes)[number];

export declare const worldTagTypes: readonly ["World", "WorldCampaigns"];

export { }
