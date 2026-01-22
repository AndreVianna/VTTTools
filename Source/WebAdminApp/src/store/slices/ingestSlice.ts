import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { ingestService, type PaginationParams } from '@services/ingestService';
import type {
    IngestAssetResponse,
    IngestJobResponse,
    IngestAssetsRequest,
    ApproveAssetsRequest,
    RejectAssetsRequest,
    DiscardAssetsRequest,
    RetryFailedRequest,
    IngestBatchResponse,
} from '@/types/ingest';
import type { RootState } from '@store/store';

export interface IngestState {
    processingAssets: IngestAssetResponse[];
    processingTotalCount: number;
    processingHasMore: boolean;
    reviewAssets: IngestAssetResponse[];
    reviewTotalCount: number;
    reviewHasMore: boolean;
    historyAssets: IngestAssetResponse[];
    historyTotalCount: number;
    historyHasMore: boolean;
    selectedAssetIds: string[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    lastJobResponse: IngestJobResponse | null;
}

const initialState: IngestState = {
    processingAssets: [],
    processingTotalCount: 0,
    processingHasMore: false,
    reviewAssets: [],
    reviewTotalCount: 0,
    reviewHasMore: false,
    historyAssets: [],
    historyTotalCount: 0,
    historyHasMore: false,
    selectedAssetIds: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    lastJobResponse: null,
};

export const fetchProcessingAssets = createAsyncThunk(
    'ingest/fetchProcessingAssets',
    async (params: PaginationParams = {}, { rejectWithValue }) => {
        try {
            return await ingestService.getProcessingAssets(params);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch processing assets';
            return rejectWithValue(error);
        }
    }
);

export const fetchReviewAssets = createAsyncThunk(
    'ingest/fetchReviewAssets',
    async (params: PaginationParams = {}, { rejectWithValue }) => {
        try {
            return await ingestService.getReviewAssets(params);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch review assets';
            return rejectWithValue(error);
        }
    }
);

export const fetchHistoryAssets = createAsyncThunk(
    'ingest/fetchHistoryAssets',
    async (params: PaginationParams = {}, { rejectWithValue }) => {
        try {
            return await ingestService.getHistoryAssets(params);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch history assets';
            return rejectWithValue(error);
        }
    }
);

export const ingestAssets = createAsyncThunk(
    'ingest/ingestAssets',
    async (request: IngestAssetsRequest, { rejectWithValue }) => {
        try {
            return await ingestService.ingestAssets(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to ingest assets';
            return rejectWithValue(error);
        }
    }
);

export const approveAssets = createAsyncThunk(
    'ingest/approveAssets',
    async (request: ApproveAssetsRequest, { rejectWithValue }) => {
        try {
            return await ingestService.approveAssets(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to approve assets';
            return rejectWithValue(error);
        }
    }
);

export const rejectAssets = createAsyncThunk(
    'ingest/rejectAssets',
    async (request: RejectAssetsRequest, { rejectWithValue }) => {
        try {
            return await ingestService.rejectAssets(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to reject assets';
            return rejectWithValue(error);
        }
    }
);

export const discardAssets = createAsyncThunk(
    'ingest/discardAssets',
    async (request: DiscardAssetsRequest, { rejectWithValue }) => {
        try {
            return await ingestService.discardAssets(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to discard assets';
            return rejectWithValue(error);
        }
    }
);

export const retryFailed = createAsyncThunk(
    'ingest/retryFailed',
    async (request: RetryFailedRequest, { rejectWithValue }) => {
        try {
            return await ingestService.retryFailed(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to retry assets';
            return rejectWithValue(error);
        }
    }
);

const ingestSlice = createSlice({
    name: 'ingest',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        toggleAssetSelection: (state, action: PayloadAction<string>) => {
            const assetId = action.payload;
            const index = state.selectedAssetIds.indexOf(assetId);
            if (index >= 0) {
                state.selectedAssetIds.splice(index, 1);
            } else {
                state.selectedAssetIds.push(assetId);
            }
        },
        selectAllAssets: (state, action: PayloadAction<string[]>) => {
            state.selectedAssetIds = action.payload;
        },
        clearSelection: (state) => {
            state.selectedAssetIds = [];
        },
        clearLastJobResponse: (state) => {
            state.lastJobResponse = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProcessingAssets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProcessingAssets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.processingAssets = action.payload.items;
                state.processingTotalCount = action.payload.totalCount;
                state.processingHasMore = action.payload.hasMore;
            })
            .addCase(fetchProcessingAssets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchReviewAssets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReviewAssets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviewAssets = action.payload.items;
                state.reviewTotalCount = action.payload.totalCount;
                state.reviewHasMore = action.payload.hasMore;
            })
            .addCase(fetchReviewAssets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchHistoryAssets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchHistoryAssets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.historyAssets = action.payload.items;
                state.historyTotalCount = action.payload.totalCount;
                state.historyHasMore = action.payload.hasMore;
            })
            .addCase(fetchHistoryAssets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(ingestAssets.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(ingestAssets.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.lastJobResponse = action.payload;
            })
            .addCase(ingestAssets.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            .addCase(approveAssets.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(approveAssets.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const succeededIds = action.payload.succeededIds;
                state.reviewAssets = state.reviewAssets.filter(
                    a => !succeededIds.includes(a.id)
                );
                state.selectedAssetIds = state.selectedAssetIds.filter(
                    id => !succeededIds.includes(id)
                );
                // Show error if some assets failed
                if (action.payload.failures.length > 0) {
                    state.error = `${action.payload.failures.length} asset(s) failed to approve`;
                }
            })
            .addCase(approveAssets.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            .addCase(rejectAssets.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(rejectAssets.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const rejectedIds = action.meta.arg.items.map(i => i.assetId);
                state.reviewAssets = state.reviewAssets.filter(
                    a => !rejectedIds.includes(a.id)
                );
                state.selectedAssetIds = state.selectedAssetIds.filter(
                    id => !rejectedIds.includes(id)
                );
                state.lastJobResponse = action.payload;
            })
            .addCase(rejectAssets.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            .addCase(discardAssets.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(discardAssets.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const succeededIds = action.payload.succeededIds;
                state.reviewAssets = state.reviewAssets.filter(
                    a => !succeededIds.includes(a.id)
                );
                state.selectedAssetIds = state.selectedAssetIds.filter(
                    id => !succeededIds.includes(id)
                );
                // Show error if some assets failed
                if (action.payload.failures.length > 0) {
                    state.error = `${action.payload.failures.length} asset(s) failed to discard`;
                }
            })
            .addCase(discardAssets.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })
            .addCase(retryFailed.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(retryFailed.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.lastJobResponse = action.payload;
            })
            .addCase(retryFailed.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    toggleAssetSelection,
    selectAllAssets,
    clearSelection,
    clearLastJobResponse,
} = ingestSlice.actions;

export const selectProcessingAssets = (state: RootState) => state.ingest.processingAssets;
export const selectProcessingTotalCount = (state: RootState) => state.ingest.processingTotalCount;
export const selectReviewAssets = (state: RootState) => state.ingest.reviewAssets;
export const selectReviewTotalCount = (state: RootState) => state.ingest.reviewTotalCount;
export const selectHistoryAssets = (state: RootState) => state.ingest.historyAssets;
export const selectHistoryTotalCount = (state: RootState) => state.ingest.historyTotalCount;
export const selectSelectedAssetIds = (state: RootState) => state.ingest.selectedAssetIds;
export const selectIsLoading = (state: RootState) => state.ingest.isLoading;
export const selectIsSubmitting = (state: RootState) => state.ingest.isSubmitting;
export const selectError = (state: RootState) => state.ingest.error;
export const selectLastJobResponse = (state: RootState) => state.ingest.lastJobResponse;

export default ingestSlice.reducer;
