import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegionTransaction } from './useRegionTransaction';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import * as polygonUtils from '@/utils/polygonUtils';
import * as regionMergeUtils from '@/utils/regionMergeUtils';

vi.mock('@/utils/polygonUtils');
vi.mock('@/utils/regionMergeUtils');

const mockCleanPolygonVertices = vi.mocked(polygonUtils.cleanPolygonVertices);
const mockFindMergeableRegions = vi.mocked(regionMergeUtils.findMergeableRegions);
const mockMergePolygons = vi.mocked(regionMergeUtils.mergePolygons);

describe('useRegionTransaction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCleanPolygonVertices.mockImplementation((vertices) => vertices);
    });

    describe('Transaction Lifecycle', () => {
        describe('startTransaction', () => {
            it('should start placement transaction with no initial segment', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'Danger Zone',
                        type: 'Elevation',
                        color: '#FF0000'
                    });
                });

                expect(result.current.transaction.type).toBe('placement');
                expect(result.current.transaction.isActive).toBe(true);
                expect(result.current.transaction.segment).not.toBeNull();
                expect(result.current.transaction.segment?.name).toBe('Danger Zone');
                expect(result.current.transaction.segment?.type).toBe('Elevation');
                expect(result.current.transaction.segment?.color).toBe('#FF0000');
                expect(result.current.transaction.segment?.vertices).toEqual([]);
                expect(result.current.transaction.segment?.regionIndex).toBeNull();
            });

            it('should start placement transaction with default values', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                expect(result.current.transaction.segment).not.toBeNull();
                expect(result.current.transaction.segment?.name).toBe('');
                expect(result.current.transaction.segment?.type).toBe('custom');
                expect(result.current.transaction.segment?.color).toBe('#808080');
            });

            it('should start editing transaction with existing region', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const existingRegion: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 5,
                    name: 'Forest Area',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
                    type: 'Difficult',
                    value: 2,
                    label: 'Dense Forest',
                    color: '#00FF00'
                };

                act(() => {
                    result.current.startTransaction('editing', existingRegion);
                });

                expect(result.current.transaction.type).toBe('editing');
                expect(result.current.transaction.isActive).toBe(true);
                expect(result.current.transaction.originalRegion).toEqual(existingRegion);
                expect(result.current.transaction.segment?.regionIndex).toBe(5);
                expect(result.current.transaction.segment?.name).toBe('Forest Area');
                expect(result.current.transaction.segment?.vertices).toEqual(existingRegion.vertices);
                expect(result.current.transaction.segment?.type).toBe('Difficult');
                expect(result.current.transaction.segment?.value).toBe(2);
                expect(result.current.transaction.segment?.label).toBe('Dense Forest');
            });

            it('should initialize empty undo/redo stacks', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                expect(result.current.transaction.localUndoStack).toEqual([]);
                expect(result.current.transaction.localRedoStack).toEqual([]);
            });
        });

        describe('addVertex', () => {
            it('should add vertex to segment', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.addVertex({ x: 100, y: 100 });
                });

                expect(result.current.transaction.segment?.vertices).toHaveLength(1);
                expect(result.current.transaction.segment?.vertices[0]).toEqual({ x: 100, y: 100 });
            });

            it('should add multiple vertices in sequence', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.addVertex({ x: 100, y: 100 });
                    result.current.addVertex({ x: 200, y: 100 });
                    result.current.addVertex({ x: 150, y: 200 });
                });

                expect(result.current.transaction.segment?.vertices).toHaveLength(3);
                expect(result.current.transaction.segment?.vertices).toEqual([
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                    { x: 150, y: 200 }
                ]);
            });

            it('should return silently when no active segment', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.addVertex({ x: 100, y: 100 });
                });

                expect(result.current.transaction.segment).toBeNull();
            });
        });

        describe('updateVertices', () => {
            it('should replace all vertices with new array', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.addVertex({ x: 0, y: 0 });
                    result.current.addVertex({ x: 50, y: 50 });
                });

                const newVertices: Point[] = [
                    { x: 100, y: 100 },
                    { x: 200, y: 200 },
                    { x: 300, y: 300 }
                ];

                act(() => {
                    result.current.updateVertices(newVertices);
                });

                expect(result.current.transaction.segment?.vertices).toEqual(newVertices);
            });

            it('should return silently when no active segment', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const newVertices: Point[] = [{ x: 100, y: 100 }];

                act(() => {
                    result.current.updateVertices(newVertices);
                });

                expect(result.current.transaction.segment).toBeNull();
            });
        });

        describe('updateSegmentProperties', () => {
            it('should update segment name', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'Old Name'
                    });
                });

                act(() => {
                    result.current.updateSegmentProperties({ name: 'New Name' });
                });

                expect(result.current.transaction.segment?.name).toBe('New Name');
            });

            it('should update multiple properties at once', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.updateSegmentProperties({
                        name: 'Updated Region',
                        type: 'Hazard',
                        value: 5,
                        label: 'Fire Zone',
                        color: '#FF6600'
                    });
                });

                expect(result.current.transaction.segment?.name).toBe('Updated Region');
                expect(result.current.transaction.segment?.type).toBe('Hazard');
                expect(result.current.transaction.segment?.value).toBe(5);
                expect(result.current.transaction.segment?.label).toBe('Fire Zone');
                expect(result.current.transaction.segment?.color).toBe('#FF6600');
            });

            it('should not modify tempId or regionIndex', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const existingRegion: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 10,
                    name: 'Region',
                    vertices: [],
                    type: 'custom'
                };

                act(() => {
                    result.current.startTransaction('editing', existingRegion);
                });

                const originalTempId = result.current.transaction.segment?.tempId;
                const originalRegionIndex = result.current.transaction.segment?.regionIndex;

                act(() => {
                    result.current.updateSegmentProperties({ name: 'Changed' });
                });

                expect(result.current.transaction.segment?.tempId).toBe(originalTempId);
                expect(result.current.transaction.segment?.regionIndex).toBe(originalRegionIndex);
            });
        });

        describe('rollbackTransaction', () => {
            it('should reset transaction to initial state', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.addVertex({ x: 100, y: 100 });
                });

                act(() => {
                    result.current.rollbackTransaction();
                });

                expect(result.current.transaction.type).toBeNull();
                expect(result.current.transaction.isActive).toBe(false);
                expect(result.current.transaction.segment).toBeNull();
                expect(result.current.transaction.localUndoStack).toEqual([]);
                expect(result.current.transaction.localRedoStack).toEqual([]);
            });
        });

        describe('clearTransaction', () => {
            it('should reset transaction to initial state', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('editing');
                    result.current.addVertex({ x: 50, y: 50 });
                });

                act(() => {
                    result.current.clearTransaction();
                });

                expect(result.current.transaction.type).toBeNull();
                expect(result.current.transaction.isActive).toBe(false);
                expect(result.current.transaction.segment).toBeNull();
            });
        });

        describe('getActiveSegment', () => {
            it('should return current segment when active', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'Test Region'
                    });
                });

                const segment = result.current.getActiveSegment();

                expect(segment).not.toBeNull();
                expect(segment?.name).toBe('Test Region');
            });

            it('should return null when no transaction active', () => {
                const { result } = renderHook(() => useRegionTransaction());

                const segment = result.current.getActiveSegment();

                expect(segment).toBeNull();
            });
        });
    });

    describe('commitTransaction - Decomposed Functions', () => {
        describe('detectRegionMerge', () => {
            it('should return null when no mergeable regions found', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                mockFindMergeableRegions.mockReturnValue([]);

                const encounter: Encounter = {
                    id: 'encounter-1',
                    adventure: null,
                    name: 'Test Encounter',
                    description: '',
                    isPublished: false,
                    light: 'Bright' as any,
                    weather: 'Clear' as any,
                    elevation: 0,
                    grid: { type: 0, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
                    stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
                    assets: [],
                    walls: [],
                    regions: [],
                    sources: []
                };

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'New Region',
                        type: 'Elevation'
                    });
                    result.current.addVertex({ x: 0, y: 0 });
                    result.current.addVertex({ x: 100, y: 0 });
                    result.current.addVertex({ x: 50, y: 100 });
                });

                const mockAddEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });
                const mockUpdateEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        },
                        encounter
                    );

                    expect(commitResult.action).not.toBe('merge');
                });

                expect(mockFindMergeableRegions).toHaveBeenCalled();
            });

            it('should detect merge with overlapping regions', async () => {
                const { result } = renderHook(() => useRegionTransaction());

                const existingRegion: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 1,
                    name: 'Region 1',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    type: 'Elevation',
                    value: 10
                };

                const mergedVertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 150, y: 0 },
                    { x: 150, y: 150 },
                    { x: 0, y: 150 }
                ];

                mockFindMergeableRegions.mockReturnValue([existingRegion]);
                mockMergePolygons.mockReturnValue(mergedVertices);

                const encounter: Encounter = {
                    id: 'encounter-1',
                    adventure: null,
                    name: 'Test Encounter',
                    description: '',
                    isPublished: false,
                    light: 'Bright' as any,
                    weather: 'Clear' as any,
                    elevation: 0,
                    grid: { type: 0, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
                    stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
                    assets: [],
                    walls: [],
                    regions: [existingRegion],
                    sources: []
                };

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'New Region',
                        type: 'Elevation',
                        value: 10
                    });
                    result.current.updateVertices([
                        { x: 50, y: 0 },
                        { x: 150, y: 0 },
                        { x: 100, y: 100 }
                    ]);
                });

                const mockAddEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });
                const mockUpdateEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        },
                        encounter
                    );

                    expect(commitResult.success).toBe(true);
                    expect(commitResult.action).toBe('merge');
                    expect(commitResult.targetRegionIndex).toBe(1);
                    expect(commitResult.mergedVertices).toEqual(mergedVertices);
                });
            });

            it('should handle merge with multiple overlapping regions', async () => {
                const { result } = renderHook(() => useRegionTransaction());

                const region1: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 5,
                    name: 'Region 1',
                    vertices: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
                    type: 'Elevation'
                };

                const region2: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 3,
                    name: 'Region 2',
                    vertices: [{ x: 50, y: 0 }, { x: 100, y: 0 }, { x: 75, y: 50 }],
                    type: 'Elevation'
                };

                mockFindMergeableRegions.mockReturnValue([region1, region2]);
                mockMergePolygons.mockReturnValue([
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ]);

                const encounter: Encounter = {
                    id: 'encounter-1',
                    adventure: null,
                    name: 'Test Encounter',
                    description: '',
                    isPublished: false,
                    light: 'Bright' as any,
                    weather: 'Clear' as any,
                    elevation: 0,
                    grid: { type: 0, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
                    stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
                    assets: [],
                    walls: [],
                    regions: [region2, region1],
                    sources: []
                };

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        type: 'Elevation'
                    });
                    result.current.updateVertices([
                        { x: 25, y: 25 },
                        { x: 75, y: 25 },
                        { x: 50, y: 75 }
                    ]);
                });

                const mockAddEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });
                const mockUpdateEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        },
                        encounter
                    );

                    expect(commitResult.success).toBe(true);
                    expect(commitResult.action).toBe('merge');
                    expect(commitResult.targetRegionIndex).toBe(3);
                    expect(commitResult.regionsToDelete).toContain(5);
                });
            });

            it('should use grid config when provided for merge', async () => {
                const { result } = renderHook(() => useRegionTransaction());

                const existingRegion: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 1,
                    name: 'Region 1',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    type: 'Elevation'
                };

                mockFindMergeableRegions.mockReturnValue([existingRegion]);
                mockMergePolygons.mockReturnValue([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }]);

                const encounter: Encounter = {
                    id: 'encounter-1',
                    adventure: null,
                    name: 'Test Encounter',
                    description: '',
                    isPublished: false,
                    light: 'Bright' as any,
                    weather: 'Clear' as any,
                    elevation: 0,
                    grid: { type: 0, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true },
                    stage: { background: null, zoomLevel: 1, panning: { x: 0, y: 0 } },
                    assets: [],
                    walls: [],
                    regions: [existingRegion],
                    sources: []
                };

                const gridConfig: GridConfig = {
                    type: 0,
                    cellSize: { width: 50, height: 50 },
                    offset: { left: 0, top: 0 },
                    snap: true
                };

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        type: 'Elevation'
                    });
                    result.current.updateVertices([
                        { x: 50, y: 0 },
                        { x: 150, y: 0 },
                        { x: 100, y: 100 }
                    ]);
                });

                const mockAddEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });
                const mockUpdateEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });

                await act(async () => {
                    await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        },
                        encounter,
                        gridConfig
                    );
                });

                expect(mockMergePolygons).toHaveBeenCalledWith(
                    expect.any(Array),
                    gridConfig
                );
            });
        });

        describe('validateSegmentVertices', () => {
            it('should fail validation when less than 3 vertices', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                mockCleanPolygonVertices.mockReturnValue([{ x: 0, y: 0 }, { x: 100, y: 0 }]);

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.addVertex({ x: 0, y: 0 });
                    result.current.addVertex({ x: 100, y: 0 });
                });

                const mockAddEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });
                const mockUpdateEncounterRegion = vi.fn().mockResolvedValue({ unwrap: vi.fn() });

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(false);
                    expect(commitResult.error).toBe('Region requires minimum 3 vertices');
                });

                expect(mockAddEncounterRegion).not.toHaveBeenCalled();
                expect(mockUpdateEncounterRegion).not.toHaveBeenCalled();
            });

            it('should clean vertices before validation', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const duplicateVertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 }
                ];
                const cleanedVertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 100, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(cleanedVertices);

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.updateVertices(duplicateVertices);
                });

                const mockUnwrap = vi.fn().mockResolvedValue({ index: 1 });
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(true);
                });

                expect(mockCleanPolygonVertices).toHaveBeenCalledWith(duplicateVertices, true);
                expect(mockAddEncounterRegion).toHaveBeenCalledWith(
                    expect.objectContaining({
                        vertices: cleanedVertices
                    })
                );
            });

            it('should pass validation with valid vertices', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const validVertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(validVertices);

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.updateVertices(validVertices);
                });

                const mockUnwrap = vi.fn().mockResolvedValue({ index: 1 });
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(true);
                    expect(commitResult.action).toBe('create');
                });
            });
        });

        describe('persistRegionToBackend', () => {
            it('should create new region for placement transaction', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const vertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(vertices);

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'New Region',
                        type: 'Elevation',
                        value: 10,
                        label: 'High Ground',
                        color: '#00FF00'
                    });
                    result.current.updateVertices(vertices);
                });

                const mockUnwrap = vi.fn().mockResolvedValue({ index: 5 });
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-123',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(true);
                    expect(commitResult.action).toBe('create');
                    expect(commitResult.regionIndex).toBe(5);
                });

                expect(mockAddEncounterRegion).toHaveBeenCalledWith({
                    encounterId: 'encounter-123',
                    name: 'New Region',
                    vertices,
                    type: 'Elevation',
                    value: 10,
                    label: 'High Ground',
                    color: '#00FF00'
                });
                expect(mockUpdateEncounterRegion).not.toHaveBeenCalled();
            });

            it('should update existing region for editing transaction', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const existingRegion: EncounterRegion = {
                    encounterId: 'encounter-1',
                    index: 3,
                    name: 'Old Name',
                    vertices: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
                    type: 'Difficult'
                };

                const updatedVertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(updatedVertices);

                act(() => {
                    result.current.startTransaction('editing', existingRegion);
                    result.current.updateSegmentProperties({ name: 'Updated Name' });
                    result.current.updateVertices(updatedVertices);
                });

                const mockAddEncounterRegion = vi.fn();
                const mockUnwrap = vi.fn().mockResolvedValue({});
                const mockUpdateEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-456',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(true);
                    expect(commitResult.action).toBe('edit');
                    expect(commitResult.regionIndex).toBe(3);
                });

                expect(mockUpdateEncounterRegion).toHaveBeenCalledWith({
                    encounterId: 'encounter-456',
                    regionIndex: 3,
                    name: 'Updated Name',
                    vertices: updatedVertices,
                    type: 'Difficult'
                });
                expect(mockAddEncounterRegion).not.toHaveBeenCalled();
            });

            it('should handle API error gracefully', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const vertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(vertices);

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.updateVertices(vertices);
                });

                const mockUnwrap = vi.fn().mockRejectedValue(new Error('Network error'));
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    const commitResult = await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );

                    expect(commitResult.success).toBe(false);
                    expect(commitResult.error).toBe('Network error');
                });
            });

            it('should omit optional properties when undefined', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const vertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(vertices);

                act(() => {
                    result.current.startTransaction('placement', undefined, {
                        name: 'Simple Region',
                        type: 'custom'
                    });
                    result.current.updateVertices(vertices);
                });

                const mockUnwrap = vi.fn().mockResolvedValue({ index: 1 });
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );
                });

                const callArgs = mockAddEncounterRegion.mock.calls[0]?.[0];
                expect(callArgs).toEqual({
                    encounterId: 'encounter-1',
                    name: 'Simple Region',
                    vertices,
                    type: 'custom',
                    color: '#808080'
                });
                expect(callArgs).not.toHaveProperty('value');
                expect(callArgs).not.toHaveProperty('label');
            });
        });

        describe('clearTransactionState', () => {
            it('should clear state after successful commit', async () => {
                const { result } = renderHook(() => useRegionTransaction());
                const vertices: Point[] = [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ];

                mockCleanPolygonVertices.mockReturnValue(vertices);

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.updateVertices(vertices);
                });

                const mockUnwrap = vi.fn().mockResolvedValue({ index: 1 });
                const mockAddEncounterRegion = vi.fn().mockReturnValue({
                    unwrap: mockUnwrap
                });
                const mockUpdateEncounterRegion = vi.fn();

                await act(async () => {
                    await result.current.commitTransaction(
                        'encounter-1',
                        {
                            addEncounterRegion: mockAddEncounterRegion,
                            updateEncounterRegion: mockUpdateEncounterRegion
                        }
                    );
                });

                expect(result.current.transaction.type).toBeNull();
                expect(result.current.transaction.isActive).toBe(false);
                expect(result.current.transaction.segment).toBeNull();
                expect(result.current.transaction.originalRegion).toBeNull();
                expect(result.current.transaction.localUndoStack).toEqual([]);
                expect(result.current.transaction.localRedoStack).toEqual([]);
            });
        });
    });

    describe('commitTransaction - Edge Cases', () => {
        it('should fail when no segment exists', async () => {
            const { result } = renderHook(() => useRegionTransaction());

            const mockAddEncounterRegion = vi.fn();
            const mockUpdateEncounterRegion = vi.fn();

            await act(async () => {
                const commitResult = await result.current.commitTransaction(
                    'encounter-1',
                    {
                        addEncounterRegion: mockAddEncounterRegion,
                        updateEncounterRegion: mockUpdateEncounterRegion
                    }
                );

                expect(commitResult.success).toBe(false);
                expect(commitResult.error).toBe('No segment to commit');
            });

            expect(mockAddEncounterRegion).not.toHaveBeenCalled();
            expect(mockUpdateEncounterRegion).not.toHaveBeenCalled();
        });

        it('should handle non-Error exceptions', async () => {
            const { result } = renderHook(() => useRegionTransaction());
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 }
            ];

            mockCleanPolygonVertices.mockReturnValue(vertices);

            act(() => {
                result.current.startTransaction('placement');
                result.current.updateVertices(vertices);
            });

            const mockUnwrap = vi.fn().mockRejectedValue('String error');
            const mockAddEncounterRegion = vi.fn().mockReturnValue({
                unwrap: mockUnwrap
            });
            const mockUpdateEncounterRegion = vi.fn();

            await act(async () => {
                const commitResult = await result.current.commitTransaction(
                    'encounter-1',
                    {
                        addEncounterRegion: mockAddEncounterRegion,
                        updateEncounterRegion: mockUpdateEncounterRegion
                    }
                );

                expect(commitResult.success).toBe(false);
                expect(commitResult.error).toBe('Transaction commit failed');
            });
        });

        it('should not clear state on failed commit', async () => {
            const { result } = renderHook(() => useRegionTransaction());
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 }
            ];

            mockCleanPolygonVertices.mockReturnValue(vertices);

            act(() => {
                result.current.startTransaction('placement', undefined, {
                    name: 'Test Region'
                });
                result.current.updateVertices(vertices);
            });

            const mockUnwrap = vi.fn().mockRejectedValue(new Error('Failed'));
            const mockAddEncounterRegion = vi.fn().mockReturnValue({
                unwrap: mockUnwrap
            });
            const mockUpdateEncounterRegion = vi.fn();

            await act(async () => {
                await result.current.commitTransaction(
                    'encounter-1',
                    {
                        addEncounterRegion: mockAddEncounterRegion,
                        updateEncounterRegion: mockUpdateEncounterRegion
                    }
                );
            });

            expect(result.current.transaction.isActive).toBe(true);
            expect(result.current.transaction.segment?.name).toBe('Test Region');
        });
    });

    describe('Local Undo/Redo', () => {
        describe('pushLocalAction', () => {
            it('should add action to undo stack', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.pushLocalAction(mockAction);
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(1);
                expect(result.current.transaction.localUndoStack[0]).toBe(mockAction);
            });

            it('should clear redo stack when new action is pushed', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const action1 = { undo: vi.fn(), redo: vi.fn() };
                const action2 = { undo: vi.fn(), redo: vi.fn() };
                const action3 = { undo: vi.fn(), redo: vi.fn() };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(action1);
                    result.current.pushLocalAction(action2);
                });

                act(() => {
                    result.current.undoLocal();
                });

                expect(result.current.transaction.localRedoStack).toHaveLength(1);

                act(() => {
                    result.current.pushLocalAction(action3);
                });

                expect(result.current.transaction.localRedoStack).toHaveLength(0);
                expect(result.current.transaction.localUndoStack).toHaveLength(2);
            });
        });

        describe('undoLocal', () => {
            it('should call undo function on last action', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const undoFn = vi.fn();
                const mockAction = {
                    undo: undoFn,
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                });

                act(() => {
                    result.current.undoLocal();
                });

                expect(undoFn).toHaveBeenCalledTimes(1);
            });

            it('should move action from undo stack to redo stack', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(1);
                expect(result.current.transaction.localRedoStack).toHaveLength(0);

                act(() => {
                    result.current.undoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(0);
                expect(result.current.transaction.localRedoStack).toHaveLength(1);
                expect(result.current.transaction.localRedoStack[0]).toBe(mockAction);
            });

            it('should return silently when undo stack is empty', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.undoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(0);
                expect(result.current.transaction.localRedoStack).toHaveLength(0);
            });

            it('should call onSyncEncounter callback with updated segment', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const onSyncEncounter = vi.fn();
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                });

                act(() => {
                    result.current.undoLocal(onSyncEncounter);
                });

                expect(onSyncEncounter).toHaveBeenCalledTimes(1);
                expect(onSyncEncounter).toHaveBeenCalledWith(result.current.transaction.segment);
            });

            it('should undo actions in LIFO order', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const callOrder: string[] = [];
                const action1 = {
                    undo: () => callOrder.push('undo1'),
                    redo: vi.fn()
                };
                const action2 = {
                    undo: () => callOrder.push('undo2'),
                    redo: vi.fn()
                };
                const action3 = {
                    undo: () => callOrder.push('undo3'),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(action1);
                    result.current.pushLocalAction(action2);
                    result.current.pushLocalAction(action3);
                });

                act(() => {
                    result.current.undoLocal();
                    result.current.undoLocal();
                    result.current.undoLocal();
                });

                expect(callOrder).toEqual(['undo3', 'undo2', 'undo1']);
            });
        });

        describe('redoLocal', () => {
            it('should call redo function on last undone action', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const redoFn = vi.fn();
                const mockAction = {
                    undo: vi.fn(),
                    redo: redoFn
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                    result.current.undoLocal();
                });

                act(() => {
                    result.current.redoLocal();
                });

                expect(redoFn).toHaveBeenCalledTimes(1);
            });

            it('should move action from redo stack to undo stack', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                    result.current.undoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(0);
                expect(result.current.transaction.localRedoStack).toHaveLength(1);

                act(() => {
                    result.current.redoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(1);
                expect(result.current.transaction.localRedoStack).toHaveLength(0);
                expect(result.current.transaction.localUndoStack[0]).toBe(mockAction);
            });

            it('should return silently when redo stack is empty', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                act(() => {
                    result.current.redoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(0);
                expect(result.current.transaction.localRedoStack).toHaveLength(0);
            });

            it('should call onSyncEncounter callback with updated segment', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const onSyncEncounter = vi.fn();
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                    result.current.undoLocal();
                });

                act(() => {
                    result.current.redoLocal(onSyncEncounter);
                });

                expect(onSyncEncounter).toHaveBeenCalledTimes(1);
                expect(onSyncEncounter).toHaveBeenCalledWith(result.current.transaction.segment);
            });

            it('should redo actions in LIFO order', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const callOrder: string[] = [];
                const action1 = {
                    undo: vi.fn(),
                    redo: () => callOrder.push('redo1')
                };
                const action2 = {
                    undo: vi.fn(),
                    redo: () => callOrder.push('redo2')
                };
                const action3 = {
                    undo: vi.fn(),
                    redo: () => callOrder.push('redo3')
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(action1);
                    result.current.pushLocalAction(action2);
                    result.current.pushLocalAction(action3);
                    result.current.undoLocal();
                    result.current.undoLocal();
                    result.current.undoLocal();
                });

                act(() => {
                    result.current.redoLocal();
                    result.current.redoLocal();
                    result.current.redoLocal();
                });

                expect(callOrder).toEqual(['redo1', 'redo2', 'redo3']);
            });
        });

        describe('canUndoLocal', () => {
            it('should return false when undo stack is empty', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                expect(result.current.canUndoLocal()).toBe(false);
            });

            it('should return true when undo stack has actions', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                });

                expect(result.current.canUndoLocal()).toBe(true);
            });
        });

        describe('canRedoLocal', () => {
            it('should return false when redo stack is empty', () => {
                const { result } = renderHook(() => useRegionTransaction());

                act(() => {
                    result.current.startTransaction('placement');
                });

                expect(result.current.canRedoLocal()).toBe(false);
            });

            it('should return true when redo stack has actions', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const mockAction = {
                    undo: vi.fn(),
                    redo: vi.fn()
                };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(mockAction);
                    result.current.undoLocal();
                });

                expect(result.current.canRedoLocal()).toBe(true);
            });
        });

        describe('clearLocalStacks', () => {
            it('should clear both undo and redo stacks', () => {
                const { result } = renderHook(() => useRegionTransaction());
                const action1 = { undo: vi.fn(), redo: vi.fn() };
                const action2 = { undo: vi.fn(), redo: vi.fn() };

                act(() => {
                    result.current.startTransaction('placement');
                    result.current.pushLocalAction(action1);
                    result.current.pushLocalAction(action2);
                    result.current.undoLocal();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(1);
                expect(result.current.transaction.localRedoStack).toHaveLength(1);

                act(() => {
                    result.current.clearLocalStacks();
                });

                expect(result.current.transaction.localUndoStack).toHaveLength(0);
                expect(result.current.transaction.localRedoStack).toHaveLength(0);
            });
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle complete placement workflow', async () => {
            const { result } = renderHook(() => useRegionTransaction());
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ];

            mockCleanPolygonVertices.mockReturnValue(vertices);

            act(() => {
                result.current.startTransaction('placement', undefined, {
                    name: 'Test Region',
                    type: 'Elevation',
                    value: 5
                });
            });

            expect(result.current.transaction.isActive).toBe(true);

            act(() => {
                vertices.forEach(v => result.current.addVertex(v));
            });

            expect(result.current.transaction.segment?.vertices).toHaveLength(4);

            const mockUnwrap = vi.fn().mockResolvedValue({ index: 10 });
            const mockAddEncounterRegion = vi.fn().mockReturnValue({
                unwrap: mockUnwrap
            });
            const mockUpdateEncounterRegion = vi.fn();

            await act(async () => {
                const commitResult = await result.current.commitTransaction(
                    'encounter-1',
                    {
                        addEncounterRegion: mockAddEncounterRegion,
                        updateEncounterRegion: mockUpdateEncounterRegion
                    }
                );

                expect(commitResult.success).toBe(true);
                expect(commitResult.action).toBe('create');
                expect(commitResult.regionIndex).toBe(10);
            });

            expect(result.current.transaction.isActive).toBe(false);
        });

        it('should handle undo/redo cycle during placement', () => {
            const { result } = renderHook(() => useRegionTransaction());
            const callOrder: string[] = [];
            const action1 = {
                undo: () => callOrder.push('undo1'),
                redo: () => callOrder.push('redo1')
            };
            const action2 = {
                undo: () => callOrder.push('undo2'),
                redo: () => callOrder.push('redo2')
            };

            act(() => {
                result.current.startTransaction('placement');
                result.current.pushLocalAction(action1);
                result.current.pushLocalAction(action2);
            });

            expect(result.current.canUndoLocal()).toBe(true);
            expect(result.current.canRedoLocal()).toBe(false);

            act(() => {
                result.current.undoLocal();
            });

            expect(callOrder).toEqual(['undo2']);
            expect(result.current.canUndoLocal()).toBe(true);
            expect(result.current.canRedoLocal()).toBe(true);

            act(() => {
                result.current.redoLocal();
            });

            expect(callOrder).toEqual(['undo2', 'redo2']);
            expect(result.current.canUndoLocal()).toBe(true);
            expect(result.current.canRedoLocal()).toBe(false);
        });

        it('should clear stacks when transaction is rolled back', () => {
            const { result } = renderHook(() => useRegionTransaction());
            const mockAction = { undo: vi.fn(), redo: vi.fn() };

            act(() => {
                result.current.startTransaction('placement');
                result.current.pushLocalAction(mockAction);
                result.current.undoLocal();
            });

            expect(result.current.transaction.localUndoStack).toHaveLength(0);
            expect(result.current.transaction.localRedoStack).toHaveLength(1);

            act(() => {
                result.current.rollbackTransaction();
            });

            expect(result.current.transaction.localUndoStack).toHaveLength(0);
            expect(result.current.transaction.localRedoStack).toHaveLength(0);
            expect(result.current.transaction.isActive).toBe(false);
        });

        it('should handle vertex state changes with undo/redo', () => {
            const { result } = renderHook(() => useRegionTransaction());
            const state = { vertices: [] as Point[] };

            const addVertexAction = (vertex: Point) => ({
                undo: () => {
                    state.vertices.pop();
                },
                redo: () => {
                    state.vertices.push(vertex);
                }
            });

            act(() => {
                result.current.startTransaction('placement');
            });

            act(() => {
                state.vertices.push({ x: 0, y: 0 });
                result.current.pushLocalAction(addVertexAction({ x: 0, y: 0 }));
            });
            expect(state.vertices).toHaveLength(1);

            act(() => {
                state.vertices.push({ x: 100, y: 0 });
                result.current.pushLocalAction(addVertexAction({ x: 100, y: 0 }));
            });
            expect(state.vertices).toHaveLength(2);

            act(() => {
                result.current.undoLocal();
            });
            expect(state.vertices).toHaveLength(1);

            act(() => {
                result.current.undoLocal();
            });
            expect(state.vertices).toHaveLength(0);

            act(() => {
                result.current.redoLocal();
            });
            expect(state.vertices).toHaveLength(1);

            act(() => {
                result.current.redoLocal();
            });
            expect(state.vertices).toHaveLength(2);
        });
    });
});
