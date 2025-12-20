export type GenerationType = 'Portrait' | 'Token';

export type ResourceApprovalStatus = 'pending' | 'approved' | 'rejected' | 'regenerating';

export type MediaType = 'image' | 'audio' | 'video';

export interface GeneratedResource {
    resourceId: string;
    assetName: string;
    generationType: GenerationType;
    kind: string;
    category?: string | undefined;
    type?: string | undefined;
    subtype?: string | undefined;
    description?: string | undefined;
    tags: string[];
    imageUrl: string;
    status: ResourceApprovalStatus;
    assetId?: string | undefined;
    mediaType: MediaType;
    contentType: string;
}

export interface ApproveResourceRequest {
    resourceId: string;
    assetName: string;
    generationType: string;
    kind: string;
    category?: string | undefined;
    type?: string | undefined;
    subtype?: string | undefined;
    description?: string | undefined;
    tags: string[];
    assetId?: string | undefined;
}

export interface ApproveResourceResponse {
    assetId: string;
}

export interface RegenerateResourceRequest {
    resourceId: string;
    assetName: string;
    generationType: string;
    kind: string;
    category?: string | undefined;
    type?: string | undefined;
    description?: string | undefined;
}

export interface RegenerateResourceResponse {
    resourceId: string;
}

export interface RejectResourceRequest {
    resourceId: string;
}

export interface GeneratedResourceResult {
    assetName: string;
    generationType: GenerationType;
    resourceId: string;
    kind: string;
    category?: string;
    type?: string;
}
