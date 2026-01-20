import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Encounter } from '@/types/domain';
import { AmbientLight, AmbientSoundSource, type Stage, type StageSettings, type StageGrid } from '@/types/stage';
import { GridType } from '@/utils/gridCalculator';
import type { UseSaveChangesProps } from './useSaveChanges';
import { useSaveChanges } from './useSaveChanges';

describe('useSaveChanges', () => {
    const createMockStageSettings = (): StageSettings => ({
        mainBackground: null,
        alternateBackground: null,
        useAlternateBackground: false,
        zoomLevel: 1,
        panning: { x: 0, y: 0 },
        ambientLight: AmbientLight.Default,
        ambientSound: null,
        ambientSoundSource: AmbientSoundSource.NotSet,
        ambientSoundVolume: 0.5,
        ambientSoundLoop: false,
        ambientSoundIsPlaying: false,
        weather: 'Clear' as never,
    });

    const createMockStageGrid = (): StageGrid => ({
        type: GridType.Square as never,
        cellSize: { width: 70, height: 70 },
        offset: { left: 0, top: 0 },
        scale: 1,
    });

    const createMockStage = (): Stage => ({
        id: 'test-stage-id',
        ownerId: 'test-owner-id',
        name: 'Test Stage',
        description: 'Test Stage Description',
        isPublished: false,
        isPublic: false,
        settings: createMockStageSettings(),
        grid: createMockStageGrid(),
        walls: [],
        regions: [],
        lights: [],
        elements: [],
        sounds: [],
    });

    const createMockEncounter = (): Encounter => ({
        id: 'test-encounter-id',
        ownerId: 'test-owner-id',
        adventure: null,
        name: 'Test Encounter',
        description: 'Test Description',
        isPublished: false,
        isPublic: false,
        stage: createMockStage(),
        actors: [],
        objects: [],
        effects: [],
    });

    const createMockProps = (): UseSaveChangesProps => ({
        encounterId: 'test-encounter-id',
        encounter: createMockEncounter(),
        isInitialized: true,
        gridConfig: {
            type: GridType.Square,
            cellSize: { width: 70, height: 70 },
            offset: { left: 0, top: 0 },
            snap: true,
            scale: 1,
        },
        patchEncounter: vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue(createMockEncounter()),
        })),
        refetch: vi.fn().mockResolvedValue(undefined),
        setSaveStatus: vi.fn(),
        setEncounter: vi.fn(),
    });

    it('should not save when encounterId is empty', async () => {
        const baseProps = createMockProps();
        const props: UseSaveChangesProps = { ...baseProps, encounterId: undefined };
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges();
        });

        expect(props.patchEncounter).not.toHaveBeenCalled();
        expect(props.setSaveStatus).not.toHaveBeenCalled();
    });

    it('should not save when encounter is null', async () => {
        const baseProps = createMockProps();
        const props: UseSaveChangesProps = { ...baseProps, encounter: null };
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges();
        });

        expect(props.patchEncounter).not.toHaveBeenCalled();
    });

    it('should not save when not initialized', async () => {
        const baseProps = createMockProps();
        const props: UseSaveChangesProps = { ...baseProps, isInitialized: false };
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges();
        });

        expect(props.patchEncounter).not.toHaveBeenCalled();
    });

    it('should not save when there are no changes', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges();
        });

        expect(props.patchEncounter).not.toHaveBeenCalled();
        expect(props.setSaveStatus).not.toHaveBeenCalled();
    });

    it('should save when name changes via overrides', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ name: 'New Name' });
        });

        expect(props.setSaveStatus).toHaveBeenCalledWith('saving');
        expect(props.patchEncounter).toHaveBeenCalledWith({
            id: 'test-encounter-id',
            request: { name: 'New Name' },
        });
        expect(props.setSaveStatus).toHaveBeenCalledWith('saved');
    });

    it('should save when description changes via overrides', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ description: 'New Description' });
        });

        expect(props.patchEncounter).toHaveBeenCalledWith({
            id: 'test-encounter-id',
            request: { description: 'New Description' },
        });
    });

    it('should save when isPublished changes via overrides', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ isPublished: true });
        });

        expect(props.patchEncounter).toHaveBeenCalledWith({
            id: 'test-encounter-id',
            request: { isPublished: true },
        });
    });

    it('should save when grid changes via overrides', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({
                grid: {
                    type: GridType.HexV,
                    cellSize: { width: 60, height: 60 },
                    offset: { left: 10, top: 10 },
                },
            });
        });

        expect(props.patchEncounter).toHaveBeenCalledWith({
            id: 'test-encounter-id',
            request: {
                grid: {
                    type: GridType.HexV,
                    cellSize: { width: 60, height: 60 },
                    offset: { left: 10, top: 10 },
                },
            },
        });
    });

    it('should update encounter state after successful save', async () => {
        const props = createMockProps();
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ name: 'New Name' });
        });

        expect(props.setEncounter).toHaveBeenCalled();
    });

    it('should call refetch when patchEncounter returns undefined', async () => {
        const props = createMockProps();
        props.patchEncounter = vi.fn(() => ({
            unwrap: vi.fn().mockResolvedValue(undefined),
        }));
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ name: 'New Name' });
        });

        expect(props.refetch).toHaveBeenCalled();
    });

    it('should set error status on save failure', async () => {
        const props = createMockProps();
        props.patchEncounter = vi.fn(() => ({
            unwrap: vi.fn().mockRejectedValue(new Error('Save failed')),
        }));
        const { result } = renderHook(() => useSaveChanges(props));

        await act(async () => {
            await result.current.saveChanges({ name: 'New Name' });
        });

        expect(props.setSaveStatus).toHaveBeenCalledWith('saving');
        expect(props.setSaveStatus).toHaveBeenCalledWith('error');
    });
});
