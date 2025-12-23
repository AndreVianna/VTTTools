export interface ResourceInfo {
    id: string;
    role: string;
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface ResourceFilterParams {
    role?: string | undefined;
    searchText?: string | undefined;
    skip?: number | undefined;
    take?: number | undefined;
}

export interface ResourceListResponse {
    items: ResourceInfo[];
    totalCount: number;
    skip: number;
    take: number;
}
