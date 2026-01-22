import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveCharacter } from './useActiveCharacter';
import { AssetKind, type PlacedAsset } from '@/types/domain';

// Mock localStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Helper to create a mock placed asset
function createMockAsset(
    id: string,
    kind: AssetKind,
    position: { x: number; y: number } = { x: 100, y: 100 },
    size: { width: number; height: number } = { width: 50, height: 50 }
): PlacedAsset {
    return {
        id,
        assetId: `asset-${id}`,
        asset: {
            id: `asset-${id}`,
            name: `Asset ${id}`,
            description: '',
            classification: {
                kind,
                category: 'Test',
                type: 'Test',
                subtype: null,
            },
            thumbnail: null,
            portrait: null,
            size: { width: 1, height: 1 },
            tokens: [],
            statBlocks: {},
            tags: [],
            ownerId: 'user-1',
            isPublished: false,
            isPublic: false,
        },
        position,
        size,
        rotation: 0,
        layer: 'Characters',
        index: 1,
        number: 1,
        name: `Asset ${id}`,
        isHidden: false,
        isLocked: false,
        labelVisibility: 'Default' as any,
        labelPosition: 'Bottom' as any,
    };
}

describe('useActiveCharacter', () => {
    beforeEach(() => {
        mockLocalStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        mockLocalStorage.clear();
    });

    describe('initial state', () => {
        it('should return null active character when no selection stored', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            expect(result.current.activeCharacterId).toBe(null);
            expect(result.current.activeCharacter).toBe(null);
            expect(result.current.activeCharacterPosition).toBe(null);
        });

        it('should restore selection from localStorage', () => {
            mockLocalStorage.setItem('vtt:activeCharacter:encounter-1', 'char-1');

            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            expect(result.current.activeCharacterId).toBe('char-1');
            expect(result.current.activeCharacter).toBeDefined();
            expect(result.current.activeCharacter?.id).toBe('char-1');
        });
    });

    describe('selectableCreatures', () => {
        it('should filter only Characters and Creatures', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character),
                createMockAsset('creature-1', AssetKind.Creature),
                createMockAsset('effect-1', AssetKind.Effect),
                createMockAsset('object-1', AssetKind.Object),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            expect(result.current.selectableCreatures).toHaveLength(2);
            expect(result.current.selectableCreatures.map(c => c.id)).toEqual(['char-1', 'creature-1']);
        });

        it('should return empty array when no creatures', () => {
            const assets = [
                createMockAsset('effect-1', AssetKind.Effect),
                createMockAsset('object-1', AssetKind.Object),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            expect(result.current.selectableCreatures).toHaveLength(0);
        });
    });

    describe('setActiveCharacter', () => {
        it('should set active character and persist to localStorage', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            act(() => {
                result.current.setActiveCharacter('char-1');
            });

            expect(result.current.activeCharacterId).toBe('char-1');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'vtt:activeCharacter:encounter-1',
                'char-1'
            );
        });

        it('should clear active character when set to null', () => {
            mockLocalStorage.setItem('vtt:activeCharacter:encounter-1', 'char-1');

            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            act(() => {
                result.current.setActiveCharacter(null);
            });

            expect(result.current.activeCharacterId).toBe(null);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
                'vtt:activeCharacter:encounter-1'
            );
        });
    });

    describe('activeCharacterPosition', () => {
        it('should return center position of active character', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character, { x: 100, y: 200 }, { width: 50, height: 50 }),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            act(() => {
                result.current.setActiveCharacter('char-1');
            });

            expect(result.current.activeCharacterPosition).toEqual({
                x: 125, // 100 + 50/2
                y: 225, // 200 + 50/2
            });
        });

        it('should return null when no active character', () => {
            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: [],
                })
            );

            expect(result.current.activeCharacterPosition).toBe(null);
        });
    });

    describe('isActiveCharacter', () => {
        it('should return true for active character', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result } = renderHook(() =>
                useActiveCharacter({
                    encounterId: 'encounter-1',
                    visibleAssets: assets,
                })
            );

            act(() => {
                result.current.setActiveCharacter('char-1');
            });

            expect(result.current.isActiveCharacter('char-1')).toBe(true);
            expect(result.current.isActiveCharacter('char-2')).toBe(false);
        });
    });

    describe('auto-clear on removal', () => {
        it('should clear selection when creature is removed from encounter', () => {
            const assets = [
                createMockAsset('char-1', AssetKind.Character),
            ];

            const { result, rerender } = renderHook(
                ({ assets }) =>
                    useActiveCharacter({
                        encounterId: 'encounter-1',
                        visibleAssets: assets,
                    }),
                { initialProps: { assets } }
            );

            act(() => {
                result.current.setActiveCharacter('char-1');
            });

            expect(result.current.activeCharacterId).toBe('char-1');

            // Remove the creature
            rerender({ assets: [] });

            expect(result.current.activeCharacterId).toBe(null);
        });
    });

    describe('encounter change', () => {
        it('should reload selection when encounter changes', () => {
            mockLocalStorage.setItem('vtt:activeCharacter:encounter-1', 'char-1');
            mockLocalStorage.setItem('vtt:activeCharacter:encounter-2', 'char-2');

            const assets1 = [createMockAsset('char-1', AssetKind.Character)];
            const assets2 = [createMockAsset('char-2', AssetKind.Character)];

            const { result, rerender } = renderHook(
                ({ encounterId, assets }) =>
                    useActiveCharacter({
                        encounterId,
                        visibleAssets: assets,
                    }),
                { initialProps: { encounterId: 'encounter-1', assets: assets1 } }
            );

            expect(result.current.activeCharacterId).toBe('char-1');

            // Change encounter
            rerender({ encounterId: 'encounter-2', assets: assets2 });

            expect(result.current.activeCharacterId).toBe('char-2');
        });
    });
});
