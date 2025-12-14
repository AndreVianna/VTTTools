export enum JobType {
    BulkAssetPortraitGeneration = 'BulkAssetPortraitGeneration',
    BulkAssetTokenGeneration = 'BulkAssetTokenGeneration',
}

export enum JobStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Success = 'Success',
    Failed = 'Failed',
    Canceled = 'Canceled',
}

export enum JobItemStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Success = 'Success',
    Failed = 'Failed',
    Canceled = 'Canceled',
}

export enum AssetKind {
    Undefined = 'Undefined',
    Character = 'Character',
    Creature = 'Creature',
    Effect = 'Effect',
    Object = 'Object',
}

export interface JobItemResponse {
    itemId: string;
    jobId: string;
    index: number;
    status: JobItemStatus;
    inputJson?: string;
    outputJson?: string;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
}

export interface JobResponse {
    jobId: string;
    jobType: JobType;
    status: JobStatus;
    totalItems: number;
    completedItems: number;
    failedItems: number;
    inputJson?: string;
    estimatedDurationMs?: number;
    actualDurationMs?: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    items: JobItemResponse[];
}

export interface JobListResponse {
    jobs: JobResponse[];
    totalCount: number;
}

export interface BulkAssetGenerationItem {
    name: string;
    kind: AssetKind;
    category: string;
    type: string;
    subtype?: string | undefined;
    size: string;
    environment?: string | undefined;
    description: string;
    tags: string[];
    generatePortrait?: boolean | undefined;
    generateToken?: boolean | undefined;
}

export interface BulkAssetGenerationRequest {
    items: BulkAssetGenerationItem[];
    templateId?: string | undefined;
    generatePortrait: boolean;
    generateToken: boolean;
}

export interface JobRetryRequest {
    jobId: string;
    itemIds?: string[];
}

export interface JobProgressEvent {
    jobId: string;
    jobType: JobType;
    itemIndex: number;
    itemStatus: JobItemStatus;
    message: string;
    currentItem: number;
    totalItems: number;
    itemName?: string;
    outputJson?: string;
    errorMessage?: string;
}

export interface JobCompletedEvent {
    jobId: string;
    jobType: string;
    status: string;
    completedItems: number;
    failedItems: number;
    totalItems: number;
}

export interface BulkAssetItemOutput {
    assetId: string;
    portraitResourceId?: string;
    tokenResourceId?: string;
}
