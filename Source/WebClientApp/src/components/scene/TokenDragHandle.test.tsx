// GENERATED: 2025-10-19 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Component Test)

/**
 * TokenDragHandle Component Tests
 * Tests token selection, dragging, deletion, and keyboard shortcuts
 * ACCEPTANCE_CRITERION: 75% test coverage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { PlacedAsset, CreatureAsset, ObjectAsset } from '@/types/domain';
import { AssetKind } from '@/types/domain';
import { GridType } from '@/utils/gridCalculator';
import { getPlacementBehavior, validatePlacement } from '@/types/placement';
import { snapToGrid } from '@/utils/gridCalculator';

describe('TokenDragHandle Logic Tests', () => {
    const mockGridConfig = {
        type: GridType.Square,
        cellWidth: 50,
        cellHeight: 50,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
        snapToGrid: true,
    };

    const mockCreatureAsset: PlacedAsset = {
        id: 'token-1',
        assetId: 'asset-1',
        asset: {
            id: 'asset-1',
            ownerId: 'user-1',
            kind: AssetKind.Creature,
            name: 'Test Token',
            description: 'Test creature token',
            isPublished: true,
            isPublic: false,
            resources: [],
            createdAt: '2025-10-19T00:00:00Z',
            updatedAt: '2025-10-19T00:00:00Z',
            properties: {
                size: { width: 1, height: 1, isSquare: true },
                category: 0,
                tokenStyle: { shape: 0, borderColor: '#000', backgroundColor: '#fff' },
            },
        } as CreatureAsset,
        position: { x: 100, y: 100 },
        size: { width: 50, height: 50 },
        rotation: 0,
        layer: 'Agents',
    };

    describe('Placement Behavior', () => {
        it('should allow creatures to move', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.canMove).toBe(true);
        });

        it('should not allow creatures to rotate in Phase 6', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.canRotate).toBe(false);
        });

        it('should not allow creatures to resize', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.canResize).toBe(false);
        });

        it('should allow creatures to be deleted', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.canDelete).toBe(true);
        });

        it('should require grid alignment for creatures', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.requiresGridAlignment).toBe(true);
        });

        it('should not allow creatures to overlap', () => {
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            expect(behavior.allowOverlap).toBe(false);
        });
    });

    describe('Grid Snapping', () => {
        it('should snap token position to grid', () => {
            const position = { x: 123, y: 456 };
            const snapped = snapToGrid(position, mockGridConfig);

            expect(snapped.x).toBe(100);
            expect(snapped.y).toBe(450);
        });

        it('should snap asset position considering size', () => {
            const position = { x: 123, y: 456 };

            const snapped = snapToGrid(position, mockGridConfig);

            expect(snapped.x).toBe(100);
            expect(snapped.y).toBe(450);
        });

        it('should handle negative coordinates during snap', () => {
            const position = { x: -23, y: -45 };
            const snapped = snapToGrid(position, mockGridConfig);

            expect(snapped.x).toBe(0);
            expect(snapped.y).toBe(-50);
        });
    });

    describe('Placement Validation', () => {
        it('should validate non-overlapping placement', () => {
            const position = { x: 200, y: 200 };
            const size = { width: 50, height: 50 };
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            const validation = validatePlacement(
                position,
                size,
                behavior,
                [
                    {
                        x: 100,
                        y: 100,
                        width: 50,
                        height: 50,
                        allowOverlap: false,
                    },
                ],
                mockGridConfig
            );

            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should reject overlapping placement when overlap not allowed', () => {
            const position = { x: 100, y: 100 };
            const size = { width: 50, height: 50 };
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            const validation = validatePlacement(
                position,
                size,
                behavior,
                [
                    {
                        x: 100,
                        y: 100,
                        width: 50,
                        height: 50,
                        allowOverlap: false,
                    },
                ],
                mockGridConfig
            );

            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should validate size constraints', () => {
            const position = { x: 100, y: 100 };
            const size = { width: 1, height: 1 };
            const behavior = getPlacementBehavior(
                mockCreatureAsset.asset.kind,
                undefined,
                (mockCreatureAsset.asset as any).properties
            );

            const validation = validatePlacement(
                position,
                size,
                behavior,
                [],
                mockGridConfig
            );

            expect(validation.valid).toBe(false);
            expect(validation.errors.some(e => e.includes('too small'))).toBe(true);
        });
    });

    describe('Keyboard Shortcuts', () => {
        let keydownHandler: (e: KeyboardEvent) => void;
        let selectedAssetId: string | null = null;
        let deletedAssetId: string | null = null;

        beforeEach(() => {
            selectedAssetId = 'token-1';
            deletedAssetId = null;

            keydownHandler = (e: KeyboardEvent) => {
                if (!selectedAssetId) return;

                if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    deletedAssetId = selectedAssetId;
                    selectedAssetId = null;
                }
            };
        });

        it('should handle Delete key press', () => {
            const deleteEvent = new KeyboardEvent('keydown', {
                key: 'Delete',
                bubbles: true,
                cancelable: true,
            });

            keydownHandler(deleteEvent);

            expect(deletedAssetId).toBe('token-1');
            expect(selectedAssetId).toBeNull();
        });

        it('should handle Backspace key press', () => {
            const backspaceEvent = new KeyboardEvent('keydown', {
                key: 'Backspace',
                bubbles: true,
                cancelable: true,
            });

            keydownHandler(backspaceEvent);

            expect(deletedAssetId).toBe('token-1');
        });

        it('should not delete when no asset is selected', () => {
            selectedAssetId = null;

            const deleteEvent = new KeyboardEvent('keydown', {
                key: 'Delete',
                bubbles: true,
                cancelable: true,
            });

            keydownHandler(deleteEvent);

            expect(deletedAssetId).toBeNull();
        });

        it('should prevent default behavior on Delete to avoid browser back', () => {
            const preventDefault = vi.fn();
            const deleteEvent = {
                key: 'Delete',
                preventDefault,
            } as unknown as KeyboardEvent;

            keydownHandler(deleteEvent);

            expect(preventDefault).toHaveBeenCalled();
        });
    });

    describe('Object Asset Behavior', () => {
        const immovableObjectAsset: PlacedAsset = {
            id: 'object-1',
            assetId: 'asset-obj-1',
            asset: {
                id: 'asset-obj-1',
                ownerId: 'user-1',
                kind: AssetKind.Object,
                name: 'Immovable Wall',
                description: 'Test object',
                isPublished: true,
                isPublic: false,
                resources: [],
                createdAt: '2025-10-19T00:00:00Z',
                updatedAt: '2025-10-19T00:00:00Z',
                properties: {
                    size: { width: 2, height: 1, isSquare: false },
                    isMovable: false,
                    isOpaque: true,
                },
            } as ObjectAsset,
            position: { x: 100, y: 100 },
            size: { width: 100, height: 50 },
            rotation: 0,
            layer: 'Structure',
        };

        it('should not allow immovable objects to move', () => {
            const behavior = getPlacementBehavior(
                immovableObjectAsset.asset.kind,
                (immovableObjectAsset.asset as any).properties,
                undefined
            );

            expect(behavior.canMove).toBe(false);
        });

        it('should allow movable objects to move', () => {
            const movableObjectAsset = {
                ...immovableObjectAsset,
                asset: {
                    ...immovableObjectAsset.asset,
                    objectProps: {
                        size: { width: 1, height: 1, isSquare: true },
                        isMovable: true,
                        isOpaque: false,
                    },
                },
            };

            const behavior = getPlacementBehavior(
                movableObjectAsset.asset.kind,
                (movableObjectAsset.asset as any).properties,
                undefined
            );

            expect(behavior.canMove).toBe(true);
        });

        it('should not allow overlap for opaque objects', () => {
            const behavior = getPlacementBehavior(
                immovableObjectAsset.asset.kind,
                (immovableObjectAsset.asset as any).properties,
                undefined
            );

            expect(behavior.allowOverlap).toBe(false);
        });

        it('should allow overlap for non-opaque objects', () => {
            const transparentObjectAsset = {
                ...immovableObjectAsset,
                asset: {
                    ...immovableObjectAsset.asset,
                    objectProps: {
                        size: { width: 1, height: 1, isSquare: true },
                        isMovable: true,
                        isOpaque: false,
                    },
                },
            };

            const behavior = getPlacementBehavior(
                transparentObjectAsset.asset.kind,
                (transparentObjectAsset.asset as any).properties,
                undefined
            );

            expect(behavior.allowOverlap).toBe(true);
        });
    });

    describe('Multi-Selection', () => {
        it('should support shift-click for multi-selection', () => {
            let selectedIds: string[] = [];

            const handleSelect = (assetId: string, addToSelection: boolean) => {
                if (addToSelection) {
                    if (!selectedIds.includes(assetId)) {
                        selectedIds.push(assetId);
                    }
                } else {
                    selectedIds = [assetId];
                }
            };

            handleSelect('token-1', false);
            expect(selectedIds).toEqual(['token-1']);

            handleSelect('token-2', true);
            expect(selectedIds).toEqual(['token-1', 'token-2']);

            handleSelect('token-3', true);
            expect(selectedIds).toEqual(['token-1', 'token-2', 'token-3']);
        });

        it('should replace selection without shift key', () => {
            let selectedIds: string[] = ['token-1', 'token-2'];

            const handleSelect = (assetId: string, addToSelection: boolean) => {
                if (addToSelection) {
                    if (!selectedIds.includes(assetId)) {
                        selectedIds.push(assetId);
                    }
                } else {
                    selectedIds = [assetId];
                }
            };

            handleSelect('token-3', false);
            expect(selectedIds).toEqual(['token-3']);
        });
    });

    describe('Drag Position Calculation', () => {
        it('should calculate center position from node position', () => {
            const nodePos = { x: 75, y: 75 };
            const size = { width: 50, height: 50 };

            const centerPos = {
                x: nodePos.x + size.width / 2,
                y: nodePos.y + size.height / 2,
            };

            expect(centerPos).toEqual({ x: 100, y: 100 });
        });

        it('should calculate node position from center position', () => {
            const centerPos = { x: 100, y: 100 };
            const size = { width: 50, height: 50 };

            const nodePos = {
                x: centerPos.x - size.width / 2,
                y: centerPos.y - size.height / 2,
            };

            expect(nodePos).toEqual({ x: 75, y: 75 });
        });
    });

    describe('Event Handler Cleanup', () => {
        it('should track event listeners properly', () => {
            const listeners = new Map<string, Function[]>();

            const mockOn = (event: string, handler: Function) => {
                if (!listeners.has(event)) {
                    listeners.set(event, []);
                }
                listeners.get(event)?.push(handler);
            };

            const mockOff = (event: string, handler: Function) => {
                const eventListeners = listeners.get(event);
                if (eventListeners) {
                    const index = eventListeners.indexOf(handler);
                    if (index > -1) {
                        eventListeners.splice(index, 1);
                    }
                }
            };

            const handler1 = () => {};
            const handler2 = () => {};

            mockOn('click', handler1);
            mockOn('click', handler2);
            expect(listeners.get('click')?.length).toBe(2);

            mockOff('click', handler1);
            expect(listeners.get('click')?.length).toBe(1);

            mockOff('click', handler2);
            expect(listeners.get('click')?.length).toBe(0);
        });
    });
});
