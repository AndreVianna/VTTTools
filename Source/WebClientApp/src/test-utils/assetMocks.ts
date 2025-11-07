/**
 * Test Utilities: Asset Mock Factories
 *
 * Provides factory functions to create mock Asset objects with new backend schema
 * (AssetToken, portrait separation, size at root, ObjectData/CreatureData)
 *
 * Usage:
 *   const token = mockAssetToken({ isDefault: true });
 *   const creature = mockCreatureAsset({ name: 'Goblin' });
 *   const object = mockObjectAsset({ size: { width: 2, height: 2, isSquare: true } });
 */

import type {
    Asset,
    AssetToken,
    ObjectData,
    CreatureData,
    MediaResource
} from '@/types/domain';
import { AssetKind, CreatureCategory, ResourceType } from '@/types/domain';

export const mockMediaResource = (overrides?: Partial<MediaResource>): MediaResource => ({
    id: 'resource-123',
    type: ResourceType.Image,
    path: '/media/test-token.png',
    metadata: {
        contentType: 'image/png',
        fileName: 'test-token.png',
        fileLength: 12345,
        imageSize: { width: 256, height: 256 }
    },
    tags: [],
    ...overrides
});

export const mockAssetToken = (overrides?: Partial<AssetToken>): AssetToken => ({
    tokenId: 'token-123',
    isDefault: true,
    token: mockMediaResource(),
    ...overrides
});

export const mockObjectAsset = (overrides?: Partial<Asset>): Asset => ({
    id: 'asset-123',
    ownerId: 'user-123',
    kind: AssetKind.Object,
    name: 'Test Object',
    description: 'Test object description',
    isPublished: false,
    isPublic: false,
    tokens: [mockAssetToken()],
    portrait: undefined,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
        isMovable: true,
        isOpaque: false,
        triggerEffectId: undefined
    } as ObjectData,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides
});

export const mockCreatureAsset = (overrides?: Partial<Asset>): Asset => ({
    id: 'asset-456',
    ownerId: 'user-123',
    kind: AssetKind.Creature,
    name: 'Test Creature',
    description: 'Test creature description',
    isPublished: false,
    isPublic: false,
    tokens: [mockAssetToken({ tokenId: 'token-456' })],
    portrait: undefined,
    size: { width: 1, height: 1, isSquare: true },
    properties: {
        statBlockId: undefined,
        category: CreatureCategory.Monster,
        tokenStyle: undefined
    } as CreatureData,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides
});

export const mockAssetWithPortrait = (overrides?: Partial<Asset>): Asset => {
    const asset = mockCreatureAsset(overrides);
    return {
        ...asset,
        portrait: mockMediaResource({
            id: 'portrait-123',
            path: '/media/test-portrait.png',
            metadata: {
                contentType: 'image/png',
                fileName: 'test-portrait.png',
                fileLength: 15000,
                imageSize: { width: 512, height: 512 }
            }
        })
    };
};

export const mockAssetWithMultipleTokens = (overrides?: Partial<Asset>): Asset => {
    const asset = mockCreatureAsset(overrides);
    return {
        ...asset,
        tokens: [
            mockAssetToken({ tokenId: 'token-1', isDefault: false }),
            mockAssetToken({ tokenId: 'token-2', isDefault: true }),
            mockAssetToken({ tokenId: 'token-3', isDefault: false })
        ]
    };
};
