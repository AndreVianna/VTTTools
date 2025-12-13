import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { jobsService, type JobHistoryParams } from '@services/jobsService';
import type {
    JobResponse,
    BulkAssetGenerationRequest,
    JobRetryRequest,
    JobProgressEvent,
    JobCompletedEvent,
} from '@/types/jobs';

export interface JobsState {
    jobs: JobResponse[];
    totalCount: number;
    currentJob: JobResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    progressEvents: Record<string, JobProgressEvent[]>;
}

const initialState: JobsState = {
    jobs: [],
    totalCount: 0,
    currentJob: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    progressEvents: {},
};

export const fetchJobHistory = createAsyncThunk(
    'jobs/fetchJobHistory',
    async (params: JobHistoryParams = {}, { rejectWithValue }) => {
        try {
            return await jobsService.getJobHistory(params);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch job history';
            return rejectWithValue(error);
        }
    }
);

export const fetchJobStatus = createAsyncThunk(
    'jobs/fetchJobStatus',
    async (jobId: string, { rejectWithValue }) => {
        try {
            return await jobsService.getJobStatus(jobId);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch job status';
            return rejectWithValue(error);
        }
    }
);

export const startBulkGeneration = createAsyncThunk(
    'jobs/startBulkGeneration',
    async (request: BulkAssetGenerationRequest, { rejectWithValue }) => {
        try {
            return await jobsService.startBulkGeneration(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to start bulk generation';
            return rejectWithValue(error);
        }
    }
);

export const cancelJob = createAsyncThunk(
    'jobs/cancelJob',
    async (jobId: string, { rejectWithValue }) => {
        try {
            await jobsService.cancelJob(jobId);
            return jobId;
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to cancel job';
            return rejectWithValue(error);
        }
    }
);

export const retryJob = createAsyncThunk(
    'jobs/retryJob',
    async (request: JobRetryRequest, { rejectWithValue }) => {
        try {
            return await jobsService.retryJob(request);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to retry job';
            return rejectWithValue(error);
        }
    }
);

const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentJob: (state) => {
            state.currentJob = null;
        },
        addProgressEvent: (state, action: PayloadAction<JobProgressEvent>) => {
            const { jobId } = action.payload;
            if (!state.progressEvents[jobId]) {
                state.progressEvents[jobId] = [];
            }
            state.progressEvents[jobId].push(action.payload);

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.completedItems = action.payload.currentItem;
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.completedItems = action.payload.currentItem;
                }
            }
        },
        handleJobCompleted: (state, action: PayloadAction<JobCompletedEvent>) => {
            const { jobId, status, completedItems, failedItems } = action.payload;

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = status as JobResponse['status'];
                state.currentJob.completedItems = completedItems;
                state.currentJob.failedItems = failedItems;
                state.currentJob.completedAt = new Date().toISOString();
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.status = status as JobResponse['status'];
                    job.completedItems = completedItems;
                    job.failedItems = failedItems;
                    job.completedAt = new Date().toISOString();
                }
            }
        },
        clearProgressEvents: (state, action: PayloadAction<string>) => {
            delete state.progressEvents[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobs = action.payload.jobs;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchJobHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchJobStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchJobStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentJob = action.payload;
            })
            .addCase(fetchJobStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            .addCase(startBulkGeneration.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(startBulkGeneration.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.currentJob = action.payload;
                state.jobs = [action.payload, ...state.jobs];
                state.totalCount += 1;
            })
            .addCase(startBulkGeneration.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            .addCase(cancelJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(cancelJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                const jobId = action.payload;
                if (state.currentJob?.jobId === jobId) {
                    state.currentJob.status = 'Cancelled' as JobResponse['status'];
                }
                const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
                if (jobIndex !== -1) {
                    const job = state.jobs[jobIndex];
                    if (job) {
                        job.status = 'Cancelled' as JobResponse['status'];
                    }
                }
            })
            .addCase(cancelJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            })

            .addCase(retryJob.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(retryJob.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.currentJob = action.payload;
                const jobIndex = state.jobs.findIndex(j => j.jobId === action.payload.jobId);
                if (jobIndex !== -1) {
                    state.jobs[jobIndex] = action.payload;
                }
            })
            .addCase(retryJob.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    clearCurrentJob,
    addProgressEvent,
    handleJobCompleted,
    clearProgressEvents,
} = jobsSlice.actions;

export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectTotalCount = (state: { jobs: JobsState }) => state.jobs.totalCount;
export const selectCurrentJob = (state: { jobs: JobsState }) => state.jobs.currentJob;
export const selectIsLoading = (state: { jobs: JobsState }) => state.jobs.isLoading;
export const selectIsSubmitting = (state: { jobs: JobsState }) => state.jobs.isSubmitting;
export const selectError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectProgressEvents = (state: { jobs: JobsState }, jobId: string) =>
    state.jobs.progressEvents[jobId] ?? [];

export default jobsSlice.reducer;
