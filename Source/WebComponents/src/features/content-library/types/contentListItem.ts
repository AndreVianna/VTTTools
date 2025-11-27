import type { AdventureStyle, ContentType, MediaResource } from '../../../types/domain';

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
