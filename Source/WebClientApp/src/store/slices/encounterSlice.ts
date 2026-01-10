import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Encounter, EncounterActor, EncounterObject, EncounterEffect, Point } from '@/types/domain';

// Encounter editor state
export interface EncounterEditorState {
    selectedAssetIndices: number[];
    copiedAssets: Array<EncounterActor | EncounterObject | EncounterEffect>;
    isDirty: boolean;
    isEditing: boolean;
    gridSnap: boolean;
    zoom: number;
    pan: Point;
}

// Main encounter state
export interface EncounterState {
    currentEncounter: Encounter | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    lastSaved: string | null;
    editor: EncounterEditorState;
    undoStack: Encounter[];
    redoStack: Encounter[];
}

const initialEditorState: EncounterEditorState = {
    selectedAssetIndices: [],
    copiedAssets: [],
    isDirty: false,
    isEditing: false,
    gridSnap: true,
    zoom: 1,
    pan: { x: 0, y: 0 },
};

const initialState: EncounterState = {
    currentEncounter: null,
    isLoading: false,
    isSaving: false,
    error: null,
    lastSaved: null,
    editor: initialEditorState,
    undoStack: [],
    redoStack: [],
};

// Async thunk for loading an encounter
export const loadEncounter = createAsyncThunk<
    Encounter,
    string,
    { rejectValue: string }
>('encounter/load', async (encounterId, { rejectWithValue }) => {
    try {
        const response = await fetch(`/api/encounters/${encounterId}`);
        if (!response.ok) {
            throw new Error(`Failed to load encounter: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to load encounter');
    }
});

// Async thunk for saving an encounter
export const saveEncounter = createAsyncThunk<
    Encounter,
    Encounter,
    { rejectValue: string }
>('encounter/save', async (encounter, { rejectWithValue }) => {
    try {
        const response = await fetch(`/api/encounters/${encounter.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(encounter),
        });
        if (!response.ok) {
            throw new Error(`Failed to save encounter: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Failed to save encounter');
    }
});

const encounterSlice = createSlice({
    name: 'encounter',
    initialState,
    reducers: {
        // Set the current encounter
        setCurrentEncounter: (state, action: PayloadAction<Encounter | null>) => {
            state.currentEncounter = action.payload;
            state.editor.isDirty = false;
            state.undoStack = [];
            state.redoStack = [];
        },

        // Clear the current encounter
        clearEncounter: (state) => {
            state.currentEncounter = null;
            state.error = null;
            state.editor = initialEditorState;
            state.undoStack = [];
            state.redoStack = [];
        },

        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Toggle edit mode
        toggleEditMode: (state) => {
            state.editor.isEditing = !state.editor.isEditing;
        },

        // Set edit mode
        setEditMode: (state, action: PayloadAction<boolean>) => {
            state.editor.isEditing = action.payload;
        },

        // Select asset
        selectAsset: (state, action: PayloadAction<number>) => {
            if (!state.editor.selectedAssetIndices.includes(action.payload)) {
                state.editor.selectedAssetIndices.push(action.payload);
            }
        },

        // Deselect asset
        deselectAsset: (state, action: PayloadAction<number>) => {
            state.editor.selectedAssetIndices = state.editor.selectedAssetIndices.filter(
                (index) => index !== action.payload
            );
        },

        // Toggle asset selection
        toggleAssetSelection: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            if (state.editor.selectedAssetIndices.includes(index)) {
                state.editor.selectedAssetIndices = state.editor.selectedAssetIndices.filter(
                    (i) => i !== index
                );
            } else {
                state.editor.selectedAssetIndices.push(index);
            }
        },

        // Clear all selections
        clearSelection: (state) => {
            state.editor.selectedAssetIndices = [];
        },

        // Select multiple assets
        selectMultipleAssets: (state, action: PayloadAction<number[]>) => {
            state.editor.selectedAssetIndices = action.payload;
        },

        // Copy selected assets
        copySelectedAssets: (state) => {
            if (!state.currentEncounter) return;

            const allAssets = [
                ...state.currentEncounter.actors,
                ...state.currentEncounter.objects,
                ...state.currentEncounter.effects,
            ];

            state.editor.copiedAssets = allAssets.filter((asset) =>
                state.editor.selectedAssetIndices.includes(asset.index)
            );
        },

        // Clear copied assets
        clearCopiedAssets: (state) => {
            state.editor.copiedAssets = [];
        },

        // Toggle grid snap
        toggleGridSnap: (state) => {
            state.editor.gridSnap = !state.editor.gridSnap;
        },

        // Set grid snap
        setGridSnap: (state, action: PayloadAction<boolean>) => {
            state.editor.gridSnap = action.payload;
        },

        // Set zoom level
        setZoom: (state, action: PayloadAction<number>) => {
            state.editor.zoom = Math.max(0.1, Math.min(5, action.payload));
        },

        // Zoom in
        zoomIn: (state) => {
            state.editor.zoom = Math.min(5, state.editor.zoom + 0.1);
        },

        // Zoom out
        zoomOut: (state) => {
            state.editor.zoom = Math.max(0.1, state.editor.zoom - 0.1);
        },

        // Reset zoom
        resetZoom: (state) => {
            state.editor.zoom = 1;
        },

        // Set pan position
        setPan: (state, action: PayloadAction<Point>) => {
            state.editor.pan = action.payload;
        },

        // Reset pan
        resetPan: (state) => {
            state.editor.pan = { x: 0, y: 0 };
        },

        // Mark as dirty (unsaved changes)
        markDirty: (state) => {
            state.editor.isDirty = true;
        },

        // Mark as clean (saved)
        markClean: (state) => {
            state.editor.isDirty = false;
        },

        // Update encounter name
        updateEncounterName: (state, action: PayloadAction<string>) => {
            if (state.currentEncounter) {
                // Push to undo stack before modifying
                state.undoStack.push({ ...state.currentEncounter });
                state.redoStack = [];

                state.currentEncounter.name = action.payload;
                state.editor.isDirty = true;
            }
        },

        // Update encounter description
        updateEncounterDescription: (state, action: PayloadAction<string>) => {
            if (state.currentEncounter) {
                // Push to undo stack before modifying
                state.undoStack.push({ ...state.currentEncounter });
                state.redoStack = [];

                state.currentEncounter.description = action.payload;
                state.editor.isDirty = true;
            }
        },

        // Undo last change
        undo: (state) => {
            if (state.undoStack.length > 0 && state.currentEncounter) {
                const previousState = state.undoStack.pop();
                if (previousState) {
                    state.redoStack.push({ ...state.currentEncounter });
                    state.currentEncounter = previousState;
                    state.editor.isDirty = true;
                }
            }
        },

        // Redo last undone change
        redo: (state) => {
            if (state.redoStack.length > 0 && state.currentEncounter) {
                const nextState = state.redoStack.pop();
                if (nextState) {
                    state.undoStack.push({ ...state.currentEncounter });
                    state.currentEncounter = nextState;
                    state.editor.isDirty = true;
                }
            }
        },

        // Clear undo/redo history
        clearHistory: (state) => {
            state.undoStack = [];
            state.redoStack = [];
        },
    },
    extraReducers: (builder) => {
        // Load encounter
        builder.addCase(loadEncounter.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loadEncounter.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentEncounter = action.payload;
            state.editor.isDirty = false;
            state.undoStack = [];
            state.redoStack = [];
        });
        builder.addCase(loadEncounter.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload ?? 'Failed to load encounter';
        });

        // Save encounter
        builder.addCase(saveEncounter.pending, (state) => {
            state.isSaving = true;
            state.error = null;
        });
        builder.addCase(saveEncounter.fulfilled, (state, action) => {
            state.isSaving = false;
            state.currentEncounter = action.payload;
            state.editor.isDirty = false;
            state.lastSaved = new Date().toISOString();
        });
        builder.addCase(saveEncounter.rejected, (state, action) => {
            state.isSaving = false;
            state.error = action.payload ?? 'Failed to save encounter';
        });
    },
});

// Export actions
export const {
    setCurrentEncounter,
    clearEncounter,
    setLoading,
    setError,
    clearError,
    toggleEditMode,
    setEditMode,
    selectAsset,
    deselectAsset,
    toggleAssetSelection,
    clearSelection,
    selectMultipleAssets,
    copySelectedAssets,
    clearCopiedAssets,
    toggleGridSnap,
    setGridSnap,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setPan,
    resetPan,
    markDirty,
    markClean,
    updateEncounterName,
    updateEncounterDescription,
    undo,
    redo,
    clearHistory,
} = encounterSlice.actions;

export default encounterSlice.reducer;

// Selectors
export const selectEncounterState = (state: { encounter: EncounterState }) => state.encounter;
export const selectCurrentEncounter = (state: { encounter: EncounterState }) => state.encounter.currentEncounter;
export const selectIsLoading = (state: { encounter: EncounterState }) => state.encounter.isLoading;
export const selectIsSaving = (state: { encounter: EncounterState }) => state.encounter.isSaving;
export const selectEncounterError = (state: { encounter: EncounterState }) => state.encounter.error;
export const selectLastSaved = (state: { encounter: EncounterState }) => state.encounter.lastSaved;
export const selectEditor = (state: { encounter: EncounterState }) => state.encounter.editor;
export const selectSelectedAssetIndices = (state: { encounter: EncounterState }) =>
    state.encounter.editor.selectedAssetIndices;
export const selectCopiedAssets = (state: { encounter: EncounterState }) => state.encounter.editor.copiedAssets;
export const selectIsDirty = (state: { encounter: EncounterState }) => state.encounter.editor.isDirty;
export const selectIsEditing = (state: { encounter: EncounterState }) => state.encounter.editor.isEditing;
export const selectGridSnap = (state: { encounter: EncounterState }) => state.encounter.editor.gridSnap;
export const selectZoom = (state: { encounter: EncounterState }) => state.encounter.editor.zoom;
export const selectPan = (state: { encounter: EncounterState }) => state.encounter.editor.pan;
export const selectCanUndo = (state: { encounter: EncounterState }) => state.encounter.undoStack.length > 0;
export const selectCanRedo = (state: { encounter: EncounterState }) => state.encounter.redoStack.length > 0;
