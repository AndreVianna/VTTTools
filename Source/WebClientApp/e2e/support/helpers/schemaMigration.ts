/**
 * Schema Migration Helper
 *
 * Utilities for migrating old E2E test data to new backend schema
 * Used when dealing with legacy test data or migration scenarios
 */

export interface OldAssetResource {
    resourceId: string;
    role: number; // 0=None, 1=Token, 2=Display, 3=Both
}

export interface NewAssetToken {
    tokenId: string;
    isDefault: boolean;
    token?: any;
}

export interface MediaResource {
    id: string;
    type: string;
    path: string;
    metadata: any;
    tags: string[];
}

/**
 * Convert old ResourceRole enum to new AssetToken structure
 */
export function migrateResourceToToken(oldResource: OldAssetResource): NewAssetToken | null {
    const isToken = (oldResource.role & 1) === 1;

    if (!isToken) {
        return null;
    }

    return {
        tokenId: oldResource.resourceId,
        isDefault: true,
        token: undefined
    };
}

/**
 * Convert old resources array to new tokens array
 */
export function migrateResourcesToTokens(oldResources: OldAssetResource[]): NewAssetToken[] {
    const tokens = oldResources
        .filter(r => (r.role & 1) === 1)
        .map((r, index) => ({
            tokenId: r.resourceId,
            isDefault: index === 0,
            token: undefined
        }));

    return tokens;
}

/**
 * Extract portrait from old resources array
 */
export function extractPortraitFromResources(oldResources: OldAssetResource[]): string | undefined {
    const displayResource = oldResources.find(r => (r.role & 2) === 2);
    return displayResource?.resourceId;
}

/**
 * Migrate complete old asset to new schema
 */
export function migrateOldAssetToNew(oldAsset: any): any {
    const tokens = oldAsset.resources
        ? migrateResourcesToTokens(oldAsset.resources)
        : [];

    const portraitId = oldAsset.resources
        ? extractPortraitFromResources(oldAsset.resources)
        : undefined;

    const size = oldAsset.objectProps?.size
        || oldAsset.creatureProps?.size
        || { width: 1, height: 1, isSquare: true };

    let properties;
    if (oldAsset.kind === 'Object' && oldAsset.objectProps) {
        const { size: _size, ...rest } = oldAsset.objectProps;
        properties = rest;
    } else if (oldAsset.kind === 'Creature' && oldAsset.creatureProps) {
        const { size: _size, ...rest } = oldAsset.creatureProps;
        properties = rest;
    }

    return {
        id: oldAsset.id,
        ownerId: oldAsset.ownerId,
        kind: oldAsset.kind,
        name: oldAsset.name,
        description: oldAsset.description || '',
        isPublished: oldAsset.isPublished || false,
        isPublic: oldAsset.isPublic || false,
        tokens,
        portraitId,
        size,
        properties,
        createdAt: oldAsset.createdAt,
        updatedAt: oldAsset.updatedAt
    };
}

/**
 * Migrate old encounter with EncounterAsset resourceId to new schema with token object
 */
export function migrateOldEncounterAssetToNew(oldEncounterAsset: any): any {
    const token = oldEncounterAsset.resourceId ? {
        id: oldEncounterAsset.resourceId,
        type: 'Image',
        path: `/media/${oldEncounterAsset.resourceId}.png`,
        metadata: {
            contentType: 'image/png',
            fileName: `${oldEncounterAsset.resourceId}.png`,
            fileLength: 0
        },
        tags: []
    } : undefined;

    return {
        ...oldEncounterAsset,
        token,
        resourceId: undefined
    };
}
