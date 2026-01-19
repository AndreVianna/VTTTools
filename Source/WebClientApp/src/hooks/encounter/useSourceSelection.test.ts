import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSourceSelection } from './useSourceSelection';

describe('useSourceSelection', () => {
    const createMockProps = () => ({
        encounterId: 'test-encounter-id',
        placedLightSources: [
            { index: 0, position: { x: 100, y: 100 }, radius: 50 },
            { index: 1, position: { x: 200, y: 200 }, radius: 60 },
        ] as never[],
        placedSoundSources: [
            { index: 0, position: { x: 150, y: 150 }, radius: 40, media: { id: 'media-1' } },
        ] as never[],
        selectedLightSourceIndex: null as number | null,
        selectedSoundSourceIndex: null as number | null,
        setSelectedLightSourceIndex: vi.fn(),
        setSelectedSoundSourceIndex: vi.fn(),
        execute: vi.fn().mockResolvedValue(undefined),
        refetch: vi.fn(),
        addLight: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ index: 2 }) })),
        deleteLight: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
        updateLight: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
        addSound: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ index: 1 }) })),
        deleteSound: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
        updateSound: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
    });

    it('should initialize with null context menu positions', () => {
        const { result } = renderHook(() => useSourceSelection(createMockProps()));

        expect(result.current.lightContextMenuPosition).toBeNull();
        expect(result.current.soundContextMenuPosition).toBeNull();
    });

    it('should initialize with null placement state', () => {
        const { result } = renderHook(() => useSourceSelection(createMockProps()));

        expect(result.current.sourcePlacementProperties).toBeNull();
        expect(result.current.activeTool).toBeNull();
    });

    it('should select light source and deselect sound source', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleLightSourceSelect(1);
        });

        expect(props.setSelectedLightSourceIndex).toHaveBeenCalledWith(1);
        expect(props.setSelectedSoundSourceIndex).toHaveBeenCalledWith(null);
    });

    it('should select sound source and deselect light source', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleSoundSourceSelect(0);
        });

        expect(props.setSelectedSoundSourceIndex).toHaveBeenCalledWith(0);
        expect(props.setSelectedLightSourceIndex).toHaveBeenCalledWith(null);
    });

    it('should set placement properties for light placement', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handlePlaceLight({ radius: 100, color: '#ff0000' } as never);
        });

        expect(result.current.sourcePlacementProperties).toEqual({
            radius: 100,
            color: '#ff0000',
            sourceType: 'light',
        });
        expect(result.current.activeTool).toBe('sourceDrawing');
    });

    it('should set placement properties for sound placement', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handlePlaceSound({ radius: 80, volume: 0.5 } as never);
        });

        expect(result.current.sourcePlacementProperties).toEqual({
            radius: 80,
            volume: 0.5,
            sourceType: 'sound',
        });
        expect(result.current.activeTool).toBe('sourceDrawing');
    });

    it('should clear placement on successful finish', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handlePlaceLight({ radius: 100 } as never);
        });

        expect(result.current.activeTool).toBe('sourceDrawing');

        act(() => {
            result.current.handleSourcePlacementFinish(true);
        });

        expect(result.current.sourcePlacementProperties).toBeNull();
        expect(result.current.activeTool).toBeNull();
    });

    it('should not clear placement on failed finish', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handlePlaceLight({ radius: 100 } as never);
        });

        act(() => {
            result.current.handleSourcePlacementFinish(false);
        });

        expect(result.current.sourcePlacementProperties).not.toBeNull();
        expect(result.current.activeTool).toBe('sourceDrawing');
    });

    it('should set light context menu position', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleLightSourceContextMenu(0, { x: 300, y: 400 });
        });

        expect(result.current.lightContextMenuPosition).toEqual({ left: 300, top: 400 });
        expect(props.setSelectedLightSourceIndex).toHaveBeenCalledWith(0);
    });

    it('should set sound context menu position', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleSoundSourceContextMenu(0, { x: 250, y: 350 });
        });

        expect(result.current.soundContextMenuPosition).toEqual({ left: 250, top: 350 });
        expect(props.setSelectedSoundSourceIndex).toHaveBeenCalledWith(0);
    });

    it('should close light context menu', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleLightSourceContextMenu(0, { x: 300, y: 400 });
        });

        act(() => {
            result.current.handleLightContextMenuClose();
        });

        expect(result.current.lightContextMenuPosition).toBeNull();
    });

    it('should close sound context menu', () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        act(() => {
            result.current.handleSoundSourceContextMenu(0, { x: 250, y: 350 });
        });

        act(() => {
            result.current.handleSoundContextMenuClose();
        });

        expect(result.current.soundContextMenuPosition).toBeNull();
    });

    it('should execute delete command for light source', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            await result.current.handleLightSourceDelete(0);
        });

        expect(props.execute).toHaveBeenCalled();
    });

    it('should execute delete command for sound source', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            await result.current.handleSoundSourceDelete(0);
        });

        expect(props.execute).toHaveBeenCalled();
    });

    it('should not delete light source without encounterId', async () => {
        const props = { ...createMockProps(), encounterId: undefined };
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            await result.current.handleLightSourceDelete(0);
        });

        expect(props.execute).not.toHaveBeenCalled();
    });

    it('should execute update command for light source', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            await result.current.handleLightSourceUpdate(0, { range: 100 });
        });

        expect(props.execute).toHaveBeenCalled();
    });

    it('should execute update command for sound source', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            await result.current.handleSoundSourceUpdate(0, { radius: 60 });
        });

        expect(props.execute).toHaveBeenCalled();
    });

    it('should call light position change via update', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            result.current.handleLightSourcePositionChange(0, { x: 500, y: 500 });
        });

        // Position change calls the update handler which calls execute
        expect(props.execute).toHaveBeenCalled();
    });

    it('should call sound position change via update', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            result.current.handleSoundSourcePositionChange(0, { x: 600, y: 600 });
        });

        expect(props.execute).toHaveBeenCalled();
    });

    it('should call light direction change via update', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSourceSelection(props));

        await act(async () => {
            result.current.handleLightSourceDirectionChange(0, 45);
        });

        expect(props.execute).toHaveBeenCalled();
    });
});
