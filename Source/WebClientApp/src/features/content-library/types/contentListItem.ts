import type { AdventureStyle } from './adventure';
import type { MediaResource } from '@/types/domain';

export enum ContentType {
    Adventure = 0,
    Campaign = 1,
    Epic = 2
}

export interface ContentListItem {
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

export interface ContentItemSummary {
    id: string;
    type: ContentType;
    name: string;
    isPublished: boolean;
    thumbnailUrl?: string;
    metadata?: Record<string, unknown>;
}
