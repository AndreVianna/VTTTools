/**
 * encounterSlice Unit Tests
 * Tests Redux encounter slice reducers, async thunks, and selectors
 * Coverage: Encounter State Management scenarios
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Encounter, EncounterActor, Point } from '@/types/domain';
import encounterReducer, {
    type EncounterState,
    clearEncounter,
    clearError,
    clearHistory,
    clearSelection,
    clearCopiedAssets,
    copySelectedAssets,
    deselectAsset,
    loadEncounter,
    markClean,
    markDirty,
    redo,
    resetPan,
    resetZoom,
    saveEncounter,
    selectAsset,
    selectCanRedo,
    selectCanUndo,
    selectCopiedAssets,
    selectCurrentEncounter,
    selectEditor,
    selectEncounterError,
    selectEncounterState,
    selectGridSnap,
    selectIsDirty,
    selectIsEditing,
    selectIsLoading,
    selectIsSaving,
    selectLastSaved,
    selectMultipleAssets,
    selectPan,
    selectSelectedAssetIndices,
    selectZoom,
    setCurrentEncounter,
    setEditMode,
    setError,
    setGridSnap,
    setLoading,
    setPan,
    setZoom,
    toggleAssetSelection,
    toggleEditMode,
    toggleGridSnap,
    undo,
    updateEncounterDescription,
    updateEncounterName,
    zoomIn,
    zoomOut,
} from './encounterSlice';

describe('encounterSlice', () => {
    let initialState: EncounterState;
    let mockEncounter: Encounter;
    let mockActor: EncounterActor;

    beforeEach(() => {
        vi.clearAllMocks();

        initialState = {
            currentEncounter: null,
            isLoading: false,
            isSaving: false,
            error: null,
            lastSaved: null,
            editor: {
                selectedAssetIndices: [],
                copiedAssets: [],
                isDirty: false,
                isEditing: false,
                gridSnap: true,
                zoom: 1,
                pan: { x: 0, y: 0 },
            },
            undoStack: [],
            redoStack: [],
        };

        mockActor = {
            asset: {
                id: 'asset-1',
                classification: { kind: 'Character' as const, category: 'Humanoid', type: 'Human', subtype: null },
                name: 'Test Asset',
                description: 'A test asset',
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
            index: 1,
            name: 'Actor 1',
            position: { x: 100, y: 100 },
            rotation: 0,
            elevation: 0,
            size: { width: 50, height: 50 },
            frame: { shape: 'Circle', borderColor: '#000', borderThickness: 1, background: '#fff' },
            isHidden: false,
            isLocked: false,
        };

        mockEncounter = {
            id: 'enc-1',
            ownerId: 'user-1',
            adventure: null,
            name: 'Test Encounter',
            description: 'A test encounter',
            isPublished: false,
            isPublic: false,
            stage: {
                id: 'stage-1',
                background: null,
                grid: { type: 1, cellSize: { width: 50, height: 50 }, offset: { left: 0, top: 0 }, snap: true, scale: 1 },
                walls: [],
                regions: [],
                lights: [],
                sounds: [],
                elements: [],
                weather: 'Clear',
                light: 0,
                zoomLevel: 1,
                panning: { x: 0, y: 0 },
            },
            actors: [mockActor],
            objects: [],
            effects: [],
        };
    });

    describe('initial state', () => {
        it('should return initial state when no action provided', () => {
            // Arrange & Act
            const result = encounterReducer(undefined, { type: 'unknown' });

            // Assert
            expect(result).toEqual(initialState);
        });

        it('should have default editor settings', () => {
            // Arrange & Act
            const result = encounterReducer(undefined, { type: 'unknown' });

            // Assert
            expect(result.editor.gridSnap).toBe(true);
            expect(result.editor.zoom).toBe(1);
            expect(result.editor.pan).toEqual({ x: 0, y: 0 });
            expect(result.editor.isEditing).toBe(false);
        });
    });

    describe('setCurrentEncounter', () => {
        it('should set the current encounter', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setCurrentEncounter(mockEncounter));

            // Assert
            expect(result.currentEncounter).toEqual(mockEncounter);
            expect(result.editor.isDirty).toBe(false);
        });

        it('should clear undo/redo stacks when setting new encounter', () => {
            // Arrange
            const previousState = {
                ...initialState,
                undoStack: [mockEncounter],
                redoStack: [mockEncounter],
            };

            // Act
            const result = encounterReducer(previousState, setCurrentEncounter(mockEncounter));

            // Assert
            expect(result.undoStack).toHaveLength(0);
            expect(result.redoStack).toHaveLength(0);
        });

        it('should allow setting encounter to null', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, setCurrentEncounter(null));

            // Assert
            expect(result.currentEncounter).toBeNull();
        });
    });

    describe('clearEncounter', () => {
        it('should clear all encounter state', () => {
            // Arrange
            const previousState: EncounterState = {
                ...initialState,
                currentEncounter: mockEncounter,
                error: 'Some error',
                editor: {
                    ...initialState.editor,
                    selectedAssetIndices: [1, 2],
                    isDirty: true,
                    isEditing: true,
                },
                undoStack: [mockEncounter],
                redoStack: [mockEncounter],
            };

            // Act
            const result = encounterReducer(previousState, clearEncounter());

            // Assert
            expect(result.currentEncounter).toBeNull();
            expect(result.error).toBeNull();
            expect(result.editor.selectedAssetIndices).toHaveLength(0);
            expect(result.editor.isDirty).toBe(false);
            expect(result.undoStack).toHaveLength(0);
            expect(result.redoStack).toHaveLength(0);
        });
    });

    describe('setLoading', () => {
        it('should set loading to true', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setLoading(true));

            // Assert
            expect(result.isLoading).toBe(true);
        });

        it('should set loading to false', () => {
            // Arrange
            const previousState = { ...initialState, isLoading: true };

            // Act
            const result = encounterReducer(previousState, setLoading(false));

            // Assert
            expect(result.isLoading).toBe(false);
        });
    });

    describe('setError and clearError', () => {
        it('should set error message', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorMessage = 'Failed to load encounter';

            // Act
            const result = encounterReducer(previousState, setError(errorMessage));

            // Assert
            expect(result.error).toBe(errorMessage);
        });

        it('should clear error', () => {
            // Arrange
            const previousState = { ...initialState, error: 'Some error' };

            // Act
            const result = encounterReducer(previousState, clearError());

            // Assert
            expect(result.error).toBeNull();
        });
    });

    describe('edit mode', () => {
        it('should toggle edit mode on', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, toggleEditMode());

            // Assert
            expect(result.editor.isEditing).toBe(true);
        });

        it('should toggle edit mode off', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, isEditing: true },
            };

            // Act
            const result = encounterReducer(previousState, toggleEditMode());

            // Assert
            expect(result.editor.isEditing).toBe(false);
        });

        it('should set edit mode directly', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setEditMode(true));

            // Assert
            expect(result.editor.isEditing).toBe(true);
        });
    });

    describe('asset selection', () => {
        it('should select an asset', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, selectAsset(1));

            // Assert
            expect(result.editor.selectedAssetIndices).toContain(1);
        });

        it('should not duplicate asset selection', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, selectedAssetIndices: [1] },
            };

            // Act
            const result = encounterReducer(previousState, selectAsset(1));

            // Assert
            expect(result.editor.selectedAssetIndices).toHaveLength(1);
        });

        it('should deselect an asset', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, selectedAssetIndices: [1, 2, 3] },
            };

            // Act
            const result = encounterReducer(previousState, deselectAsset(2));

            // Assert
            expect(result.editor.selectedAssetIndices).toEqual([1, 3]);
        });

        it('should toggle asset selection on', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, toggleAssetSelection(1));

            // Assert
            expect(result.editor.selectedAssetIndices).toContain(1);
        });

        it('should toggle asset selection off', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, selectedAssetIndices: [1] },
            };

            // Act
            const result = encounterReducer(previousState, toggleAssetSelection(1));

            // Assert
            expect(result.editor.selectedAssetIndices).not.toContain(1);
        });

        it('should clear all selections', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, selectedAssetIndices: [1, 2, 3] },
            };

            // Act
            const result = encounterReducer(previousState, clearSelection());

            // Assert
            expect(result.editor.selectedAssetIndices).toHaveLength(0);
        });

        it('should select multiple assets', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, selectMultipleAssets([1, 2, 3]));

            // Assert
            expect(result.editor.selectedAssetIndices).toEqual([1, 2, 3]);
        });
    });

    describe('copy/paste assets', () => {
        it('should copy selected assets', () => {
            // Arrange
            const previousState: EncounterState = {
                ...initialState,
                currentEncounter: mockEncounter,
                editor: { ...initialState.editor, selectedAssetIndices: [1] },
            };

            // Act
            const result = encounterReducer(previousState, copySelectedAssets());

            // Assert
            expect(result.editor.copiedAssets).toHaveLength(1);
            expect(result.editor.copiedAssets[0]).toEqual(mockActor);
        });

        it('should not copy when no encounter is loaded', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, selectedAssetIndices: [1] },
            };

            // Act
            const result = encounterReducer(previousState, copySelectedAssets());

            // Assert
            expect(result.editor.copiedAssets).toHaveLength(0);
        });

        it('should clear copied assets', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, copiedAssets: [mockActor] },
            };

            // Act
            const result = encounterReducer(previousState, clearCopiedAssets());

            // Assert
            expect(result.editor.copiedAssets).toHaveLength(0);
        });
    });

    describe('grid snap', () => {
        it('should toggle grid snap off', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, toggleGridSnap());

            // Assert
            expect(result.editor.gridSnap).toBe(false);
        });

        it('should toggle grid snap on', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, gridSnap: false },
            };

            // Act
            const result = encounterReducer(previousState, toggleGridSnap());

            // Assert
            expect(result.editor.gridSnap).toBe(true);
        });

        it('should set grid snap directly', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setGridSnap(false));

            // Assert
            expect(result.editor.gridSnap).toBe(false);
        });
    });

    describe('zoom controls', () => {
        it('should set zoom level', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setZoom(2));

            // Assert
            expect(result.editor.zoom).toBe(2);
        });

        it('should clamp zoom to minimum 0.1', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setZoom(0.01));

            // Assert
            expect(result.editor.zoom).toBe(0.1);
        });

        it('should clamp zoom to maximum 5', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, setZoom(10));

            // Assert
            expect(result.editor.zoom).toBe(5);
        });

        it('should zoom in by 0.1', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, zoomIn());

            // Assert
            expect(result.editor.zoom).toBeCloseTo(1.1);
        });

        it('should zoom out by 0.1', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, zoomOut());

            // Assert
            expect(result.editor.zoom).toBeCloseTo(0.9);
        });

        it('should reset zoom to 1', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, zoom: 2.5 },
            };

            // Act
            const result = encounterReducer(previousState, resetZoom());

            // Assert
            expect(result.editor.zoom).toBe(1);
        });

        it('should not zoom out below minimum', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, zoom: 0.1 },
            };

            // Act
            const result = encounterReducer(previousState, zoomOut());

            // Assert
            expect(result.editor.zoom).toBe(0.1);
        });

        it('should not zoom in above maximum', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, zoom: 5 },
            };

            // Act
            const result = encounterReducer(previousState, zoomIn());

            // Assert
            expect(result.editor.zoom).toBe(5);
        });
    });

    describe('pan controls', () => {
        it('should set pan position', () => {
            // Arrange
            const previousState = { ...initialState };
            const newPan: Point = { x: 100, y: 200 };

            // Act
            const result = encounterReducer(previousState, setPan(newPan));

            // Assert
            expect(result.editor.pan).toEqual(newPan);
        });

        it('should reset pan to origin', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, pan: { x: 500, y: 300 } },
            };

            // Act
            const result = encounterReducer(previousState, resetPan());

            // Assert
            expect(result.editor.pan).toEqual({ x: 0, y: 0 });
        });
    });

    describe('dirty state', () => {
        it('should mark as dirty', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, markDirty());

            // Assert
            expect(result.editor.isDirty).toBe(true);
        });

        it('should mark as clean', () => {
            // Arrange
            const previousState = {
                ...initialState,
                editor: { ...initialState.editor, isDirty: true },
            };

            // Act
            const result = encounterReducer(previousState, markClean());

            // Assert
            expect(result.editor.isDirty).toBe(false);
        });
    });

    describe('updateEncounterName', () => {
        it('should update encounter name and mark dirty', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, updateEncounterName('New Name'));

            // Assert
            expect(result.currentEncounter?.name).toBe('New Name');
            expect(result.editor.isDirty).toBe(true);
        });

        it('should push to undo stack before modifying', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, updateEncounterName('New Name'));

            // Assert
            expect(result.undoStack).toHaveLength(1);
            expect(result.undoStack[0]?.name).toBe('Test Encounter');
        });

        it('should clear redo stack on new change', () => {
            // Arrange
            const previousState = {
                ...initialState,
                currentEncounter: mockEncounter,
                redoStack: [mockEncounter],
            };

            // Act
            const result = encounterReducer(previousState, updateEncounterName('New Name'));

            // Assert
            expect(result.redoStack).toHaveLength(0);
        });

        it('should not update when no encounter loaded', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = encounterReducer(previousState, updateEncounterName('New Name'));

            // Assert
            expect(result.currentEncounter).toBeNull();
        });
    });

    describe('updateEncounterDescription', () => {
        it('should update encounter description and mark dirty', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, updateEncounterDescription('New Description'));

            // Assert
            expect(result.currentEncounter?.description).toBe('New Description');
            expect(result.editor.isDirty).toBe(true);
        });
    });

    describe('undo/redo', () => {
        it('should undo last change', () => {
            // Arrange
            const originalEncounter = { ...mockEncounter, name: 'Original' };
            const modifiedEncounter = { ...mockEncounter, name: 'Modified' };
            const previousState: EncounterState = {
                ...initialState,
                currentEncounter: modifiedEncounter,
                undoStack: [originalEncounter],
            };

            // Act
            const result = encounterReducer(previousState, undo());

            // Assert
            expect(result.currentEncounter?.name).toBe('Original');
            expect(result.undoStack).toHaveLength(0);
            expect(result.redoStack).toHaveLength(1);
        });

        it('should redo undone change', () => {
            // Arrange
            const originalEncounter = { ...mockEncounter, name: 'Original' };
            const modifiedEncounter = { ...mockEncounter, name: 'Modified' };
            const previousState: EncounterState = {
                ...initialState,
                currentEncounter: originalEncounter,
                redoStack: [modifiedEncounter],
            };

            // Act
            const result = encounterReducer(previousState, redo());

            // Assert
            expect(result.currentEncounter?.name).toBe('Modified');
            expect(result.redoStack).toHaveLength(0);
            expect(result.undoStack).toHaveLength(1);
        });

        it('should not undo when stack is empty', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, undo());

            // Assert
            expect(result.currentEncounter).toEqual(mockEncounter);
        });

        it('should not redo when stack is empty', () => {
            // Arrange
            const previousState = { ...initialState, currentEncounter: mockEncounter };

            // Act
            const result = encounterReducer(previousState, redo());

            // Assert
            expect(result.currentEncounter).toEqual(mockEncounter);
        });

        it('should clear history', () => {
            // Arrange
            const previousState: EncounterState = {
                ...initialState,
                undoStack: [mockEncounter, mockEncounter],
                redoStack: [mockEncounter],
            };

            // Act
            const result = encounterReducer(previousState, clearHistory());

            // Assert
            expect(result.undoStack).toHaveLength(0);
            expect(result.redoStack).toHaveLength(0);
        });
    });

    describe('async thunks - loadEncounter', () => {
        it('should set loading state on pending', () => {
            // Arrange
            const previousState = { ...initialState };
            const action = { type: loadEncounter.pending.type };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should set encounter on fulfilled', () => {
            // Arrange
            const previousState = { ...initialState, isLoading: true };
            const action = { type: loadEncounter.fulfilled.type, payload: mockEncounter };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isLoading).toBe(false);
            expect(result.currentEncounter).toEqual(mockEncounter);
            expect(result.editor.isDirty).toBe(false);
        });

        it('should set error on rejected', () => {
            // Arrange
            const previousState = { ...initialState, isLoading: true };
            const action = { type: loadEncounter.rejected.type, payload: 'Network error' };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isLoading).toBe(false);
            expect(result.error).toBe('Network error');
        });

        it('should use default error message when payload is undefined', () => {
            // Arrange
            const previousState = { ...initialState, isLoading: true };
            const action = { type: loadEncounter.rejected.type, payload: undefined };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.error).toBe('Failed to load encounter');
        });
    });

    describe('async thunks - saveEncounter', () => {
        it('should set saving state on pending', () => {
            // Arrange
            const previousState = { ...initialState };
            const action = { type: saveEncounter.pending.type };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isSaving).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should update encounter and mark clean on fulfilled', () => {
            // Arrange
            const previousState = {
                ...initialState,
                isSaving: true,
                editor: { ...initialState.editor, isDirty: true },
            };
            const action = { type: saveEncounter.fulfilled.type, payload: mockEncounter };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isSaving).toBe(false);
            expect(result.currentEncounter).toEqual(mockEncounter);
            expect(result.editor.isDirty).toBe(false);
            expect(result.lastSaved).not.toBeNull();
        });

        it('should set error on rejected', () => {
            // Arrange
            const previousState = { ...initialState, isSaving: true };
            const action = { type: saveEncounter.rejected.type, payload: 'Save failed' };

            // Act
            const result = encounterReducer(previousState, action);

            // Assert
            expect(result.isSaving).toBe(false);
            expect(result.error).toBe('Save failed');
        });
    });

    describe('selectors', () => {
        let mockState: { encounter: EncounterState };

        beforeEach(() => {
            mockState = {
                encounter: {
                    currentEncounter: mockEncounter,
                    isLoading: false,
                    isSaving: true,
                    error: 'Test error',
                    lastSaved: '2025-01-01T00:00:00Z',
                    editor: {
                        selectedAssetIndices: [1, 2],
                        copiedAssets: [mockActor],
                        isDirty: true,
                        isEditing: true,
                        gridSnap: false,
                        zoom: 1.5,
                        pan: { x: 100, y: 200 },
                    },
                    undoStack: [mockEncounter],
                    redoStack: [mockEncounter],
                },
            };
        });

        it('should select entire encounter state', () => {
            // Act
            const result = selectEncounterState(mockState);

            // Assert
            expect(result).toEqual(mockState.encounter);
        });

        it('should select current encounter', () => {
            // Act
            const result = selectCurrentEncounter(mockState);

            // Assert
            expect(result).toEqual(mockEncounter);
        });

        it('should select isLoading', () => {
            // Act
            const result = selectIsLoading(mockState);

            // Assert
            expect(result).toBe(false);
        });

        it('should select isSaving', () => {
            // Act
            const result = selectIsSaving(mockState);

            // Assert
            expect(result).toBe(true);
        });

        it('should select error', () => {
            // Act
            const result = selectEncounterError(mockState);

            // Assert
            expect(result).toBe('Test error');
        });

        it('should select lastSaved', () => {
            // Act
            const result = selectLastSaved(mockState);

            // Assert
            expect(result).toBe('2025-01-01T00:00:00Z');
        });

        it('should select editor state', () => {
            // Act
            const result = selectEditor(mockState);

            // Assert
            expect(result).toEqual(mockState.encounter.editor);
        });

        it('should select selected asset indices', () => {
            // Act
            const result = selectSelectedAssetIndices(mockState);

            // Assert
            expect(result).toEqual([1, 2]);
        });

        it('should select copied assets', () => {
            // Act
            const result = selectCopiedAssets(mockState);

            // Assert
            expect(result).toEqual([mockActor]);
        });

        it('should select isDirty', () => {
            // Act
            const result = selectIsDirty(mockState);

            // Assert
            expect(result).toBe(true);
        });

        it('should select isEditing', () => {
            // Act
            const result = selectIsEditing(mockState);

            // Assert
            expect(result).toBe(true);
        });

        it('should select gridSnap', () => {
            // Act
            const result = selectGridSnap(mockState);

            // Assert
            expect(result).toBe(false);
        });

        it('should select zoom', () => {
            // Act
            const result = selectZoom(mockState);

            // Assert
            expect(result).toBe(1.5);
        });

        it('should select pan', () => {
            // Act
            const result = selectPan(mockState);

            // Assert
            expect(result).toEqual({ x: 100, y: 200 });
        });

        it('should select canUndo when undo stack has items', () => {
            // Act
            const result = selectCanUndo(mockState);

            // Assert
            expect(result).toBe(true);
        });

        it('should select canRedo when redo stack has items', () => {
            // Act
            const result = selectCanRedo(mockState);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for canUndo when undo stack is empty', () => {
            // Arrange
            const emptyUndoState = {
                encounter: { ...mockState.encounter, undoStack: [] },
            };

            // Act
            const result = selectCanUndo(emptyUndoState);

            // Assert
            expect(result).toBe(false);
        });

        it('should return false for canRedo when redo stack is empty', () => {
            // Arrange
            const emptyRedoState = {
                encounter: { ...mockState.encounter, redoStack: [] },
            };

            // Act
            const result = selectCanRedo(emptyRedoState);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('state immutability', () => {
        it('should not mutate original state when setting encounter', () => {
            // Arrange
            const previousState = { ...initialState };
            const frozenState = Object.freeze(previousState);

            // Act & Assert - should not throw
            expect(() => encounterReducer(frozenState, setCurrentEncounter(mockEncounter))).not.toThrow();
        });

        it('should not mutate original state when selecting assets', () => {
            // Arrange
            const previousState = { ...initialState };
            const originalIndices = [...previousState.editor.selectedAssetIndices];

            // Act
            encounterReducer(previousState, selectAsset(1));

            // Assert - original should be unchanged
            expect(previousState.editor.selectedAssetIndices).toEqual(originalIndices);
        });
    });

    describe('edge cases', () => {
        it('should handle empty encounter actors array', () => {
            // Arrange
            const emptyEncounter = { ...mockEncounter, actors: [], objects: [], effects: [] };
            const previousState = {
                ...initialState,
                currentEncounter: emptyEncounter,
                editor: { ...initialState.editor, selectedAssetIndices: [1] },
            };

            // Act
            const result = encounterReducer(previousState, copySelectedAssets());

            // Assert
            expect(result.editor.copiedAssets).toHaveLength(0);
        });

        it('should handle zoom boundary conditions', () => {
            // Arrange - at minimum zoom
            let state = { ...initialState, editor: { ...initialState.editor, zoom: 0.1 } };

            // Act - try to zoom out further
            state = encounterReducer(state, zoomOut());

            // Assert - should stay at minimum
            expect(state.editor.zoom).toBe(0.1);
        });

        it('should handle multiple consecutive undo operations', () => {
            // Arrange - set up state with multiple undo history
            let state: EncounterState = { ...initialState, currentEncounter: mockEncounter };
            state = encounterReducer(state, updateEncounterName('Name 1'));
            state = encounterReducer(state, updateEncounterName('Name 2'));
            state = encounterReducer(state, updateEncounterName('Name 3'));

            // Act - undo twice
            state = encounterReducer(state, undo());
            state = encounterReducer(state, undo());

            // Assert
            expect(state.currentEncounter?.name).toBe('Name 1');
            expect(state.undoStack).toHaveLength(1);
            expect(state.redoStack).toHaveLength(2);
        });
    });
});
