import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GridType } from '@/utils/gridCalculator';
import { useLayerVisibility } from './useLayerVisibility';

describe('useLayerVisibility', () => {
    it('should initialize with all layers visible', () => {
        const { result } = renderHook(() => useLayerVisibility());

        expect(result.current.scopeVisibility).toEqual({
            regions: true,
            walls: true,
            objects: true,
            monsters: true,
            characters: true,
            lights: true,
            sounds: true,
            fogOfWar: true,
        });
    });

    it('should toggle individual layer visibility', () => {
        const { result } = renderHook(() => useLayerVisibility());

        act(() => {
            result.current.handleLayerVisibilityToggle('walls');
        });

        expect(result.current.scopeVisibility.walls).toBe(false);
        expect(result.current.scopeVisibility.regions).toBe(true);

        act(() => {
            result.current.handleLayerVisibilityToggle('walls');
        });

        expect(result.current.scopeVisibility.walls).toBe(true);
    });

    it('should hide all layers', () => {
        const { result } = renderHook(() => useLayerVisibility());

        act(() => {
            result.current.handleHideAllLayers();
        });

        expect(result.current.scopeVisibility).toEqual({
            regions: false,
            walls: false,
            objects: false,
            monsters: false,
            characters: false,
            lights: false,
            sounds: false,
            fogOfWar: false,
        });
    });

    it('should show all layers', () => {
        const { result } = renderHook(() => useLayerVisibility());

        act(() => {
            result.current.handleHideAllLayers();
        });

        act(() => {
            result.current.handleShowAllLayers();
        });

        expect(result.current.scopeVisibility).toEqual({
            regions: true,
            walls: true,
            objects: true,
            monsters: true,
            characters: true,
            lights: true,
            sounds: true,
            fogOfWar: true,
        });
    });

    it('should call onGridTypeChange when hiding all layers', () => {
        const onGridTypeChange = vi.fn();
        const { result } = renderHook(() =>
            useLayerVisibility({ onGridTypeChange }),
        );

        act(() => {
            result.current.handleHideAllLayers();
        });

        expect(onGridTypeChange).toHaveBeenCalledWith(GridType.NoGrid);
    });

    it('should call onGridTypeChange when showing all layers if grid is NoGrid', () => {
        const onGridTypeChange = vi.fn();
        const { result } = renderHook(() =>
            useLayerVisibility({
                onGridTypeChange,
                currentGridType: GridType.NoGrid,
            }),
        );

        act(() => {
            result.current.handleShowAllLayers();
        });

        expect(onGridTypeChange).toHaveBeenCalledWith(GridType.Square);
    });

    it('should not call onGridTypeChange when showing all layers if grid is not NoGrid', () => {
        const onGridTypeChange = vi.fn();
        const { result } = renderHook(() =>
            useLayerVisibility({
                onGridTypeChange,
                currentGridType: GridType.Square,
            }),
        );

        act(() => {
            result.current.handleShowAllLayers();
        });

        expect(onGridTypeChange).not.toHaveBeenCalled();
    });

    it('should allow direct state updates via setScopeVisibility', () => {
        const { result } = renderHook(() => useLayerVisibility());

        act(() => {
            result.current.setScopeVisibility({
                regions: false,
                walls: true,
                objects: false,
                monsters: true,
                characters: false,
                lights: true,
                sounds: false,
                fogOfWar: true,
            });
        });

        expect(result.current.scopeVisibility).toEqual({
            regions: false,
            walls: true,
            objects: false,
            monsters: true,
            characters: false,
            lights: true,
            sounds: false,
            fogOfWar: true,
        });
    });
});
