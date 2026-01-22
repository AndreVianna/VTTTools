import { AssetKind } from '@/types/jobs';

export { AssetKind };

export enum IngestStatus {
    None = 'None',
    Pending = 'Pending',
    Processing = 'Processing',
    PartialFailure = 'PartialFailure',
    Failed = 'Failed',
    PendingReview = 'PendingReview',
    Approved = 'Approved',
    Discarded = 'Discarded',
}

export interface IngestResourceInfo {
    id: string;
    path: string;
    fileName?: string;
    contentType?: string;
}

export interface IngestAssetResponse {
    id: string;
    name: string;
    description?: string;
    kind: AssetKind;
    category: string;
    type: string;
    subtype?: string;
    ingestStatus: IngestStatus;
    aiPrompt?: string;
    portrait?: IngestResourceInfo;
    tokens?: IngestResourceInfo[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IngestAssetListResponse {
    items: IngestAssetResponse[];
    totalCount: number;
    hasMore: boolean;
}

export interface IngestJobResponse {
    jobId: string;
    itemCount: number;
    assetIds: string[];
}

export interface IngestAssetItem {
    name: string;
    kind?: AssetKind;
    category: string;
    type: string;
    subtype?: string;
    size?: string;
    environment?: string;
    description?: string;
    tags?: string[];
}

export interface IngestAssetsRequest {
    items: IngestAssetItem[];
}

export interface ApproveAssetsRequest {
    assetIds: string[];
}

export interface RejectAssetItem {
    assetId: string;
    aiPrompt: string;
}

export interface RejectAssetsRequest {
    items: RejectAssetItem[];
}

export interface DiscardAssetsRequest {
    assetIds: string[];
}

export interface RetryFailedRequest {
    assetIds: string[];
}

export interface IngestBatchFailure {
    assetId: string;
    reason: string;
}

export interface IngestBatchResponse {
    succeededIds: string[];
    failures: IngestBatchFailure[];
}
