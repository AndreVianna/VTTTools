export enum JobType {
    BulkAssetPortraitGeneration = 'BulkAssetPortraitGeneration',
    BulkAssetTokenGeneration = 'BulkAssetTokenGeneration',
}

export enum JobStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
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

export interface JobCreatedEvent {
    eventType: 'JobCreated';
    jobId: string;
    type: string;
    estimatedDuration?: string;
    totalItems: number;
}

export interface JobCompletedEvent {
    eventType: 'JobCompleted';
    jobId: string;
}

export interface JobCanceledEvent {
    eventType: 'JobCanceled';
    jobId: string;
}

export interface JobRetriedEvent {
    eventType: 'JobRetried';
    jobId: string;
}

export interface JobItemStartedEvent {
    eventType: 'JobItemStarted';
    jobId: string;
    index: number;
    startedAt?: string;
}

export interface JobItemCompletedEvent {
    eventType: 'JobItemCompleted';
    jobId: string;
    index: number;
    status: JobItemStatus;
    message?: string;
    completedAt?: string;
}

export type JobEvent = JobCreatedEvent | JobCompletedEvent | JobCanceledEvent | JobRetriedEvent;
export type JobItemEvent = JobItemStartedEvent | JobItemCompletedEvent;

export interface JobProgressItem {
    jobId: string;
    index: number;
    status: JobItemStatus;
    message?: string;
    startedAt?: string;
    completedAt?: string;
}

export interface BulkAssetItemOutput {
    assetId: string;
    portraitResourceId?: string;
    tokenResourceId?: string;
}
