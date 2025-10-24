import type { ContentItem } from './contentItem';
import type { Scene } from './scene';

export enum AdventureStyle {
    Generic = 0,
    OpenWorld = 1,
    DungeonCrawl = 2,
    HackNSlash = 3,
    Survival = 4,
    GoalDriven = 5,
    RandomlyGenerated = 6
}

export interface Adventure extends ContentItem {
    type: 'adventure';
    style: AdventureStyle;
    isOneShot: boolean;
    campaignId: string | null;
    backgroundId: string | null;
    scenes?: any[];
}

export interface CreateAdventureRequest {
    name: string;
    description?: string;
    style: AdventureStyle;
    isOneShot?: boolean;
    campaignId?: string | null;
    backgroundId?: string | null;
}

export interface UpdateAdventureRequest {
    id: string;
    name?: string;
    description?: string;
    style?: AdventureStyle;
    isOneShot?: boolean;
    campaignId?: string | null;
    backgroundId?: string | null;
    isPublished?: boolean;
}

export interface AdventureWithScenes extends Adventure {
    scenes: Scene[];
}
