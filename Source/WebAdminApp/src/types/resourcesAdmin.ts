export interface ResourceClassification {
    kind: string;
    category: string;
    type: string;
    subtype?: string;
}

export interface ResourceInfo {
    id: string;
    resourceType: string;
    classification: ResourceClassification;
    description?: string;
    fileName: string;
    contentType: string;
    fileLength: number;
    ownerId: string;
    isPublished: boolean;
    isPublic: boolean;
}

export interface ResourceFilterParams {
    resourceType?: string | undefined;
    contentKind?: string | undefined;
    category?: string | undefined;
    searchText?: string | undefined;
    isPublished?: boolean | undefined;
    isPublic?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
}

export interface ResourceListResponse {
    items: ResourceInfo[];
    totalCount: number;
    skip: number;
    take: number;
}
