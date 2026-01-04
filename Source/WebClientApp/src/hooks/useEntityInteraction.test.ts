import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type Konva from 'konva';
import { useEntityInteraction } from './useEntityInteraction';
import {
    AssetKind,
    LabelVisibility,
    LabelPosition,
    type PlacedAsset,
    type Asset,
} from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';

// Mock dependencies
vi.mock('@/utils/gridSnapping', () => ({
    snapToGridCenter: vi.fn((position: { x: number; y: number }) => position),
}));

vi.mock('@/types/placement', () => ({
    getPlacementBehavior: vi.fn(() => ({
        allowOverlap: false,
        minSize: { width: 0.125, height: 0.125 },
        maxSize: { width: 20, height: 20 },
    })),
    validatePlacement: vi.fn(() => ({ valid: true, errors: [] })),
}));

vi.mock('@/components/encounter/tokenPlacementUtils', () => ({
    getAssetSize: vi.fn((asset: Asset) => {
        if (asset.size?.width && asset.size?.height) {
            return { width: asset.size.width, height: asset.size.height };
        }
        return { width: 1, height: 1 };
    }),
    getAssetGroup: vi.fn((asset: Asset) => {
        if (asset.classification.kind === AssetKind.Creature) return 'layer-monsters';
        if (asset.classification.kind === AssetKind.Character) return 'layer-characters';
        return 'layer-objects';
    }),
}));

import { validatePlacement } from '@/types/placement';
import { snapToGridCenter } from '@/utils/gridSnapping';

// Factory functions
const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
    id: 'asset-1',
    name: 'Test Asset',
    description: '',
    classification: {
        kind: AssetKind.Object,
        category: 'General',
        type: 'Prop',
        subtype: null,
    },
    size: { width: 1, height: 1 },
    thumbnail: null,
    portrait: null,
    tokens: [],
    statBlocks: {},
    tags: [],
    ownerId: 'user-1',
    isPublished: false,
    isPublic: false,
    ...overrides,
});

const createMockCreatureAsset = (overrides?: Partial<Asset>): Asset => createMockAsset({
    id: 'creature-asset-1',
    name: 'Goblin',
    classification: {
        kind: AssetKind.Creature,
        category: 'Monster',
        type: 'Goblinoid',
        subtype: null,
    },
    ...overrides,
});

const createMockPlacedAsset = (overrides?: Partial<PlacedAsset>): PlacedAsset => ({
    id: 'placed-asset-1',
    assetId: 'asset-1',
    asset: createMockAsset(),
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'layer-objects',
    index: 0,
    number: 1,
    name: 'Test Asset',
    isHidden: false,
    isLocked: false,
    labelVisibility: LabelVisibility.Default,
    labelPosition: LabelPosition.Default,
    ...overrides,
});

const createMockGridConfig = (overrides?: Partial<GridConfig>): GridConfig => ({
    type: 'square',
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    ...overrides,
} as GridConfig);

const createMockStage = (overrides?: Partial<{
    x: number;
    y: number;
    scaleX: number;
    pointerPosition: { x: number; y: number } | null;
}>) => {
    const config = {
        x: 0,
        y: 0,
        scaleX: 1,
        pointerPosition: { x: 100, y: 100 },
        ...overrides,
    };
    return {
        x: () => config.x,
        y: () => config.y,
        scaleX: () => config.scaleX,
        getPointerPosition: () => config.pointerPosition,
    };
};

const createMockKonvaEvent = (overrides?: Partial<{
    button: number;
    shiftKey: boolean;
    className: string;
    stage: ReturnType<typeof createMockStage> | null;
}>) => {
    const config = {
        button: 0,
        shiftKey: false,
        className: 'Rect',
        stage: createMockStage(),
        ...overrides,
    };
    return {
        evt: {
            button: config.button,
            shiftKey: config.shiftKey,
        },
        target: {
            getStage: () => config.stage,
            getClassName: () => config.className,
        },
    } as unknown as Konva.KonvaEventObject<MouseEvent>;
};

const createDefaultProps = (overrides?: Partial<Parameters<typeof useEntityInteraction>[0]>) => ({
    draggedAsset: null as Asset | null,
    gridConfig: createMockGridConfig(),
    snapMode: SnapMode.Full,
    placedAssets: [] as PlacedAsset[],
    onAssetPlaced: vi.fn(),
    onDragComplete: vi.fn(),
    collisionData: [] as Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        allowOverlap: boolean;
    }>,
    ...overrides,
});

describe('useEntityInteraction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with null cursor position', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should initialize with valid placement state', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(result.current.isValidPlacement).toBe(true);
        });

        it('should expose handleMouseMove callback', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(typeof result.current.handleMouseMove).toBe('function');
        });

        it('should expose handleClick callback', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(typeof result.current.handleClick).toBe('function');
        });

        it('should expose setCursorPosition setter', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(typeof result.current.setCursorPosition).toBe('function');
        });

        it('should expose setIsValidPlacement setter', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(typeof result.current.setIsValidPlacement).toBe('function');
        });
    });

    describe('handleMouseMove - early returns', () => {
        it('should return early when no dragged asset', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            const event = createMockKonvaEvent();

            act(() => {
                result.current.handleMouseMove(event);
            });

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should return early when stage is null', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({ stage: null });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should return early when pointer position is null', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: null }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should throttle mouse move events (skip if < 33ms)', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event1 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 100, y: 100 } }),
            });
            const event2 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 200, y: 200 } }),
            });

            // First call should work
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event1);
            });

            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });

            // Second call within throttle window should be ignored
            act(() => {
                vi.advanceTimersByTime(20); // Only 20ms later
                result.current.handleMouseMove(event2);
            });

            // Position should still be from first call
            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });
        });

        it('should process mouse move after throttle period', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event1 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 100, y: 100 } }),
            });
            const event2 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 200, y: 200 } }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event1);
            });

            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });

            act(() => {
                vi.advanceTimersByTime(50); // More than 33ms later
                result.current.handleMouseMove(event2);
            });

            expect(result.current.cursorPosition).toEqual({ x: 200, y: 200 });
        });
    });

    describe('handleMouseMove - position calculation', () => {
        it('should calculate world position from screen position', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({
                    x: 50,
                    y: 50,
                    scaleX: 1,
                    pointerPosition: { x: 150, y: 150 },
                }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // World position = (screen - stageOffset) / scale = (150 - 50) / 1 = 100
            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });
        });

        it('should account for stage scale', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({
                    x: 0,
                    y: 0,
                    scaleX: 2,
                    pointerPosition: { x: 200, y: 200 },
                }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // World position = screen / scale = 200 / 2 = 100
            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });
        });

        it('should call snapToGridCenter with correct parameters', () => {
            const props = createDefaultProps({
                draggedAsset: createMockAsset({ size: { width: 2, height: 2 } }),
                snapMode: SnapMode.Half,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(snapToGridCenter).toHaveBeenCalledWith(
                { x: 100, y: 100 },
                { width: 2, height: 2 },
                props.gridConfig,
                SnapMode.Half
            );
        });
    });

    describe('handleMouseMove - validation', () => {
        it('should validate placement for Object assets', () => {
            const asset = createMockAsset();
            const props = createDefaultProps({ draggedAsset: asset });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(validatePlacement).toHaveBeenCalled();
        });

        it('should validate placement for Creature assets', () => {
            const asset = createMockCreatureAsset();
            const props = createDefaultProps({ draggedAsset: asset });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(validatePlacement).toHaveBeenCalled();
        });

        it('should set isValidPlacement to true when validation passes', () => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: true, errors: [] });

            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(result.current.isValidPlacement).toBe(true);
        });

        it('should set isValidPlacement to false when validation fails', () => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: false, errors: ['Overlap'] });

            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(result.current.isValidPlacement).toBe(false);
        });

        it('should skip collision check when Shift key is pressed', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({ shiftKey: true });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // validatePlacement should be called with skipCollisionCheck = true
            expect(validatePlacement).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
                expect.any(Array),
                expect.any(Object),
                true // skipCollisionCheck
            );
        });
    });

    describe('handleClick - early returns', () => {
        it('should return early when no dragged asset', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({ onAssetPlaced });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();

            act(() => {
                result.current.handleClick(event);
            });

            expect(onAssetPlaced).not.toHaveBeenCalled();
        });

        it('should return early when no cursor position', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Don't move mouse first, so cursorPosition is null
            const event = createMockKonvaEvent();

            act(() => {
                result.current.handleClick(event);
            });

            expect(onAssetPlaced).not.toHaveBeenCalled();
        });

        it('should return early on non-left button click', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Set cursor position
            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            // Right click (button 2)
            const clickEvent = createMockKonvaEvent({ button: 2 });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onAssetPlaced).not.toHaveBeenCalled();
        });

        it('should return early when clicking on Image element', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Set cursor position
            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            // Click on Image
            const clickEvent = createMockKonvaEvent({ className: 'Image' });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onAssetPlaced).not.toHaveBeenCalled();
        });

        it('should return early when placement is invalid', () => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: false, errors: ['Invalid'] });

            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Set cursor position (which will set isValidPlacement to false)
            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            expect(result.current.isValidPlacement).toBe(false);

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onAssetPlaced).not.toHaveBeenCalled();
        });
    });

    describe('handleClick - asset placement', () => {
        beforeEach(() => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: true, errors: [] });
        });

        it('should call onAssetPlaced with correct PlacedAsset', () => {
            const onAssetPlaced = vi.fn();
            const draggedAsset = createMockAsset({ id: 'test-asset-id', name: 'Test Item' });
            const props = createDefaultProps({
                draggedAsset,
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Set cursor position
            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            // Click to place
            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onAssetPlaced).toHaveBeenCalledTimes(1);
            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.assetId).toBe('test-asset-id');
            expect(placedAsset.asset).toBe(draggedAsset);
            expect(placedAsset.name).toBe('Test Item');
            expect(placedAsset.position).toEqual({ x: 100, y: 100 });
        });

        it('should generate unique ID for placed asset', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // Set cursor position
            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            // Click to place
            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.id).toMatch(/^encounter-asset-\d+-[a-z0-9]+$/);
        });

        it('should calculate size from grid config and asset size', () => {
            const onAssetPlaced = vi.fn();
            const draggedAsset = createMockAsset({ size: { width: 2, height: 3 } });
            const gridConfig = createMockGridConfig({ cellSize: { width: 50, height: 50 } });
            const props = createDefaultProps({
                draggedAsset,
                gridConfig,
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.size).toEqual({ width: 100, height: 150 }); // 2*50, 3*50
        });

        it('should set correct layer for Object assets', () => {
            const onAssetPlaced = vi.fn();
            const draggedAsset = createMockAsset();
            const props = createDefaultProps({
                draggedAsset,
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.layer).toBe('layer-objects');
        });

        it('should set correct layer for Creature assets', () => {
            const onAssetPlaced = vi.fn();
            const draggedAsset = createMockCreatureAsset();
            const props = createDefaultProps({
                draggedAsset,
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.layer).toBe('layer-monsters');
        });

        it('should set index based on current placedAssets length', () => {
            const onAssetPlaced = vi.fn();
            const existingAssets = [
                createMockPlacedAsset({ id: 'existing-1' }),
                createMockPlacedAsset({ id: 'existing-2' }),
            ];
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                placedAssets: existingAssets,
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.index).toBe(2); // Two existing assets
        });

        it('should set default values for label settings', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.labelVisibility).toBe(LabelVisibility.Default);
            expect(placedAsset.labelPosition).toBe(LabelPosition.Default);
        });

        it('should set default values for hidden and locked', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.isHidden).toBe(false);
            expect(placedAsset.isLocked).toBe(false);
        });
    });

    describe('handleClick - normal vs shift-click mode', () => {
        beforeEach(() => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: true, errors: [] });
        });

        it('should call onDragComplete on normal click', () => {
            const onDragComplete = vi.fn();
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
                onDragComplete,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent({ shiftKey: false });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onDragComplete).toHaveBeenCalledTimes(1);
        });

        it('should reset cursor position on normal click', () => {
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced: vi.fn(),
                onDragComplete: vi.fn(),
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            expect(result.current.cursorPosition).not.toBeNull();

            const clickEvent = createMockKonvaEvent({ shiftKey: false });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should NOT call onDragComplete on shift-click', () => {
            const onDragComplete = vi.fn();
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
                onDragComplete,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent({ shiftKey: true });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(onDragComplete).not.toHaveBeenCalled();
        });

        it('should keep cursor position on shift-click for continuous placement', () => {
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced: vi.fn(),
                onDragComplete: vi.fn(),
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });

            const clickEvent = createMockKonvaEvent({ shiftKey: true });
            act(() => {
                result.current.handleClick(clickEvent);
            });

            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });
        });

        it('should allow multiple placements with shift-click', () => {
            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                onAssetPlaced,
                onDragComplete: vi.fn(),
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            // First placement
            const moveEvent1 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 100, y: 100 } }),
            });
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent1);
            });

            const clickEvent1 = createMockKonvaEvent({ shiftKey: true });
            act(() => {
                result.current.handleClick(clickEvent1);
            });

            expect(onAssetPlaced).toHaveBeenCalledTimes(1);

            // Second placement at different position
            const moveEvent2 = createMockKonvaEvent({
                stage: createMockStage({ pointerPosition: { x: 200, y: 200 } }),
            });
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent2);
            });

            const clickEvent2 = createMockKonvaEvent({ shiftKey: true });
            act(() => {
                result.current.handleClick(clickEvent2);
            });

            expect(onAssetPlaced).toHaveBeenCalledTimes(2);
        });
    });

    describe('snap mode handling', () => {
        it('should use current snap mode from ref', () => {
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                snapMode: SnapMode.Full,
            });
            const { result, rerender } = renderHook(
                (p) => useEntityInteraction(p),
                { initialProps: props }
            );

            const event = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(snapToGridCenter).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
                SnapMode.Full
            );

            // Update snap mode
            rerender({ ...props, snapMode: SnapMode.Half });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(snapToGridCenter).toHaveBeenLastCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
                SnapMode.Half
            );
        });
    });

    describe('collision data handling', () => {
        it('should pass collision data to validatePlacement', () => {
            const collisionData = [
                { x: 50, y: 50, width: 50, height: 50, allowOverlap: false },
                { x: 150, y: 150, width: 50, height: 50, allowOverlap: true },
            ];
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                collisionData,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(validatePlacement).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Object),
                collisionData,
                expect.any(Object),
                expect.any(Boolean)
            );
        });
    });

    describe('setCursorPosition and setIsValidPlacement', () => {
        it('should allow external cursor position reset', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            expect(result.current.cursorPosition).toEqual({ x: 100, y: 100 });

            act(() => {
                result.current.setCursorPosition(null);
            });

            expect(result.current.cursorPosition).toBeNull();
        });

        it('should allow setting custom cursor position', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            act(() => {
                result.current.setCursorPosition({ x: 300, y: 400 });
            });

            expect(result.current.cursorPosition).toEqual({ x: 300, y: 400 });
        });

        it('should allow external validation state override', () => {
            const { result } = renderHook(() => useEntityInteraction(createDefaultProps()));

            expect(result.current.isValidPlacement).toBe(true);

            act(() => {
                result.current.setIsValidPlacement(false);
            });

            expect(result.current.isValidPlacement).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle zero scale stage', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({
                    scaleX: 0,
                    pointerPosition: { x: 100, y: 100 },
                }),
            });

            // This would cause division by zero, but should be handled
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // Position would be Infinity, but hook should still not crash
            expect(result.current.cursorPosition).toBeDefined();
        });

        it('should handle negative stage offset', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({
                    x: -100,
                    y: -100,
                    pointerPosition: { x: 50, y: 50 },
                }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // World position = (50 - (-100)) / 1 = 150
            expect(result.current.cursorPosition).toEqual({ x: 150, y: 150 });
        });

        it('should handle very small scale', () => {
            const props = createDefaultProps({ draggedAsset: createMockAsset() });
            const { result } = renderHook(() => useEntityInteraction(props));

            const event = createMockKonvaEvent({
                stage: createMockStage({
                    scaleX: 0.1,
                    pointerPosition: { x: 100, y: 100 },
                }),
            });

            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(event);
            });

            // World position = 100 / 0.1 = 1000
            expect(result.current.cursorPosition).toEqual({ x: 1000, y: 1000 });
        });

        it('should handle empty placedAssets array for index calculation', () => {
            vi.mocked(validatePlacement).mockReturnValue({ valid: true, errors: [] });

            const onAssetPlaced = vi.fn();
            const props = createDefaultProps({
                draggedAsset: createMockAsset(),
                placedAssets: [],
                onAssetPlaced,
            });
            const { result } = renderHook(() => useEntityInteraction(props));

            const moveEvent = createMockKonvaEvent();
            act(() => {
                vi.advanceTimersByTime(50);
                result.current.handleMouseMove(moveEvent);
            });

            const clickEvent = createMockKonvaEvent();
            act(() => {
                result.current.handleClick(clickEvent);
            });

            const placedAsset = onAssetPlaced.mock.calls[0]?.[0];
            expect(placedAsset.index).toBe(0);
        });
    });
});
