import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFogOfWarManagement } from './useFogOfWarManagement';

// Mock the useFogOfWarPlacement hook
vi.mock('@/hooks/useFogOfWarPlacement', () => ({
    useFogOfWarPlacement: vi.fn(() => ({
        handlePolygonComplete: vi.fn(),
        handleBucketFillComplete: vi.fn(),
    })),
}));

describe('useFogOfWarManagement', () => {
    const defaultProps = {
        encounterId: 'test-encounter-id',
        placedRegions: [],
        stageSize: { width: 1000, height: 800 },
        setPlacedRegions: vi.fn(),
        setEncounter: vi.fn(),
        setErrorMessage: vi.fn(),
        refetch: vi.fn().mockResolvedValue({ data: null }),
        execute: vi.fn().mockResolvedValue(undefined),
        addRegion: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ index: 0 }) })),
        deleteRegion: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
    };

    it('should initialize with default fog mode as add', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        expect(result.current.fogMode).toBe('add');
    });

    it('should initialize with no fog drawing tool selected', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        expect(result.current.fogDrawingTool).toBeNull();
    });

    it('should initialize with empty fog drawing vertices', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        expect(result.current.fogDrawingVertices).toEqual([]);
    });

    it('should change fog mode when handleFogModeChange is called', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        act(() => {
            result.current.handleFogModeChange('subtract');
        });

        expect(result.current.fogMode).toBe('subtract');

        act(() => {
            result.current.handleFogModeChange('add');
        });

        expect(result.current.fogMode).toBe('add');
    });

    it('should set fog drawing tool to polygon when handleFogDrawPolygon is called', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        act(() => {
            result.current.handleFogDrawPolygon();
        });

        expect(result.current.fogDrawingTool).toBe('polygon');
    });

    it('should set fog drawing tool to bucketFill when handleFogBucketFill is called', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        act(() => {
            result.current.handleFogBucketFill();
        });

        expect(result.current.fogDrawingTool).toBe('bucketFill');
    });

    it('should filter fog of war regions from placed regions', () => {
        const propsWithRegions = {
            ...defaultProps,
            placedRegions: [
                { encounterId: 'test', index: 0, name: 'FOW 1', type: 'FogOfWar', vertices: [] },
                { encounterId: 'test', index: 1, name: 'Terrain 1', type: 'Terrain', vertices: [] },
                { encounterId: 'test', index: 2, name: 'FOW 2', type: 'FogOfWar', vertices: [] },
            ] as never[],
        };

        const { result } = renderHook(() => useFogOfWarManagement(propsWithRegions));

        expect(result.current.fowRegions).toHaveLength(2);
        expect(result.current.fowRegions.every(r => r.type === 'FogOfWar')).toBe(true);
    });

    it('should return empty array when no fog of war regions exist', () => {
        const propsWithRegions = {
            ...defaultProps,
            placedRegions: [
                { encounterId: 'test', index: 0, name: 'Terrain 1', type: 'Terrain', vertices: [] },
                { encounterId: 'test', index: 1, name: 'Terrain 2', type: 'Terrain', vertices: [] },
            ] as never[],
        };

        const { result } = renderHook(() => useFogOfWarManagement(propsWithRegions));

        expect(result.current.fowRegions).toHaveLength(0);
    });

    it('should allow direct state updates via setFogDrawingTool', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        act(() => {
            result.current.setFogDrawingTool('polygon');
        });

        expect(result.current.fogDrawingTool).toBe('polygon');

        act(() => {
            result.current.setFogDrawingTool(null);
        });

        expect(result.current.fogDrawingTool).toBeNull();
    });

    it('should allow direct state updates via setFogDrawingVertices', () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));
        const vertices = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];

        act(() => {
            result.current.setFogDrawingVertices(vertices);
        });

        expect(result.current.fogDrawingVertices).toEqual(vertices);
    });

    it('should switch to add mode when handleFogHideAll is called in subtract mode', async () => {
        const { result } = renderHook(() => useFogOfWarManagement(defaultProps));

        act(() => {
            result.current.handleFogModeChange('subtract');
        });

        expect(result.current.fogMode).toBe('subtract');

        await act(async () => {
            await result.current.handleFogHideAll();
        });

        expect(result.current.fogMode).toBe('add');
    });
});
