export type ContentType = 'scene' | 'adventure' | 'campaign' | 'epic';

export interface ContentItem {
    id: string;
    type: ContentType;
    name: string;
    description: string;
    ownerId: string;
    isPublished: boolean;
}

export interface ContentItemSummary {
    id: string;
    type: ContentType;
    name: string;
    isPublished: boolean;
    thumbnailUrl?: string;
    metadata?: Record<string, unknown>;
}
