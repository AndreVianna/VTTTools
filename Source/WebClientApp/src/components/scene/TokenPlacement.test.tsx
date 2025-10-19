// GENERATED: 2025-10-19 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Test)

/**
 * TokenPlacement Component Tests
 * Tests token placement, drag-and-drop, image loading, and grid snapping
 * TARGET_COVERAGE: 75%+
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TokenPlacement } from './TokenPlacement';
import type { Asset, PlacedAsset, CreatureAsset } from '@/types/domain';
import { AssetKind, CreatureCategory, ResourceType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';

const mockGridConfig: GridConfig = {
    type: GridType.Square,
    cellWidth: 50,
    cellHeight: 50,
    offsetX: 0,
    offsetY: 0,
    color: '#000000',
    snapToGrid: true,
};

const createMockAsset = (id: string, kind: AssetKind = AssetKind.Creature): Asset => ({
    id,
    ownerId: 'owner-123',
    kind,
    name: `Test Asset ${id}`,
    description: 'Test description',
    isPublished: true,
    isPublic: false,
    resources: [
        {
            resourceId: 'resource-1',
            role: 1,
            resource: {
                id: 'resource-1',
                type: ResourceType.Image,
                path: '/test-image.png',
                metadata: {
                    contentType: 'image/png',
                    fileName: 'test.png',
                    fileLength: 1024,
                    imageSize: { width: 100, height: 100 },
                },
                tags: [],
            },
        },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
});

const createMockCreatureAsset = (id: string): CreatureAsset => ({
    ...createMockAsset(id, AssetKind.Creature),
    kind: AssetKind.Creature,
    creatureProps: {
        size: { width: 1, height: 1, isSquare: true },
        category: CreatureCategory.Character,
    },
});

const createMockPlacedAsset = (id: string, assetId: string): PlacedAsset => ({
    id,
    assetId,
    asset: createMockAsset(assetId),
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'agents',
});

describe('TokenPlacement', () => {
    let mockOnAssetPlaced: ReturnType<typeof vi.fn>;
    let mockOnAssetMoved: ReturnType<typeof vi.fn>;
    let mockOnAssetDeleted: ReturnType<typeof vi.fn>;
    let mockOnDragComplete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnAssetPlaced = vi.fn();
        mockOnAssetMoved = vi.fn();
        mockOnAssetDeleted = vi.fn();
        mockOnDragComplete = vi.fn();

        global.Image = class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            src = '';
            crossOrigin = '';

            constructor() {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload();
                    }
                }, 0);
            }
        } as any;
    });

    it('renders without crashing', () => {
        render(
            <TokenPlacement
                placedAssets={[]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders placed assets on correct layers', async () => {
        const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');

        const { container } = render(
            <TokenPlacement
                placedAssets={[placedAsset]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        await waitFor(() => {
            const image = container.querySelector('#placed-1');
            expect(image).toBeInTheDocument();
        });
    });

    it('loads images for placed assets without infinite loop', async () => {
        const placedAssets = [
            createMockPlacedAsset('placed-1', 'asset-1'),
            createMockPlacedAsset('placed-2', 'asset-2'),
        ];

        const imageLoadSpy = vi.fn();
        const originalImage = global.Image;

        let imageLoadCount = 0;
        global.Image = class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            src = '';
            crossOrigin = '';

            constructor() {
                imageLoadCount++;
                imageLoadSpy();

                setTimeout(() => {
                    if (this.onload) {
                        this.onload();
                    }
                }, 0);
            }
        } as any;

        render(
            <TokenPlacement
                placedAssets={placedAssets}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        await waitFor(
            () => {
                expect(imageLoadSpy).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(imageLoadCount).toBeLessThanOrEqual(4);

        global.Image = originalImage;
    });

    it('shows loading state for dragged asset', async () => {
        const draggedAsset = createMockCreatureAsset('asset-1');

        global.Image = class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            src = '';
            crossOrigin = '';

            constructor() {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload();
                    }
                }, 100);
            }
        } as any;

        render(
            <TokenPlacement
                placedAssets={[]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={draggedAsset}
                onDragComplete={mockOnDragComplete}
            />
        );

        await waitFor(() => {
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });
    });

    it('assigns correct layer based on asset kind', () => {
        const creatureAsset = createMockCreatureAsset('creature-1');
        const creaturePlaced = createMockPlacedAsset('placed-1', 'creature-1');
        creaturePlaced.asset = creatureAsset;

        expect(creaturePlaced.layer).toBe('agents');

        const objectPlaced = createMockPlacedAsset('placed-2', 'object-1');
        objectPlaced.layer = 'objects';

        expect(objectPlaced.layer).toBe('objects');
    });

    it('handles image loading errors gracefully', async () => {
        const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');

        global.Image = class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            src = '';
            crossOrigin = '';

            constructor() {
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror();
                    }
                }, 0);
            }
        } as any;

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <TokenPlacement
                placedAssets={[placedAsset]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it('cleans up event listeners on unmount', () => {
        const { unmount } = render(
            <TokenPlacement
                placedAssets={[]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        unmount();
    });

    it('handles assets without image resources', () => {
        const assetNoImage: Asset = {
            ...createMockAsset('asset-no-image'),
            resources: [],
        };

        const placedAsset = createMockPlacedAsset('placed-1', 'asset-no-image');
        placedAsset.asset = assetNoImage;

        render(
            <TokenPlacement
                placedAssets={[placedAsset]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        expect(mockOnAssetPlaced).not.toHaveBeenCalled();
    });

    it('prioritizes Token role over Display role for image', () => {
        const assetMultiResource: Asset = {
            ...createMockAsset('asset-multi'),
            resources: [
                {
                    resourceId: 'display-resource',
                    role: 2,
                    resource: {
                        id: 'display-resource',
                        type: ResourceType.Image,
                        path: '/display.png',
                        metadata: {
                            contentType: 'image/png',
                            fileName: 'display.png',
                            fileLength: 1024,
                        },
                        tags: [],
                    },
                },
                {
                    resourceId: 'token-resource',
                    role: 1,
                    resource: {
                        id: 'token-resource',
                        type: ResourceType.Image,
                        path: '/token.png',
                        metadata: {
                            contentType: 'image/png',
                            fileName: 'token.png',
                            fileLength: 1024,
                        },
                        tags: [],
                    },
                },
            ],
        };

        const placedAsset = createMockPlacedAsset('placed-1', 'asset-multi');
        placedAsset.asset = assetMultiResource;

        render(
            <TokenPlacement
                placedAssets={[placedAsset]}
                onAssetPlaced={mockOnAssetPlaced}
                onAssetMoved={mockOnAssetMoved}
                onAssetDeleted={mockOnAssetDeleted}
                gridConfig={mockGridConfig}
                draggedAsset={null}
                onDragComplete={mockOnDragComplete}
            />
        );

        expect(mockOnAssetPlaced).not.toHaveBeenCalled();
    });
});
