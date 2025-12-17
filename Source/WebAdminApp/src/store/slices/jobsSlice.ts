import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { jobsService, type JobHistoryParams } from '@services/jobsService';
import type {
    JobResponse,
    BulkAssetGenerationRequest,
    JobRetryRequest,
    JobItemStartedEvent,
    JobItemCompletedEvent,
    JobProgressItem,
} from '@/types/jobs';
import { JobItemStatus, JobStatus } from '@/types/jobs';

export interface JobsState {
    jobs: JobResponse[];
    totalCount: number;
    currentJob: JobResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    itemUpdates: Record<string, JobProgressItem[]>;
}

const initialState: JobsState = {
    jobs: [],
    totalCount: 0,
    currentJob: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    itemUpdates: {},
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
        addItemStarted: (state, action: PayloadAction<JobItemStartedEvent>) => {
            const { jobId, index, startedAt } = action.payload;
            if (!state.itemUpdates[jobId]) {
                state.itemUpdates[jobId] = [];
            }

            const progressItem: JobProgressItem = {
                jobId,
                index,
                status: JobItemStatus.InProgress,
                ...(startedAt !== undefined && { startedAt }),
            };

            const existingIndex = state.itemUpdates[jobId].findIndex(u => u.index === index);
            if (existingIndex !== -1) {
                state.itemUpdates[jobId][existingIndex] = progressItem;
            } else {
                state.itemUpdates[jobId].push(progressItem);
            }

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = JobStatus.InProgress;
            }
        },
        addItemCompleted: (state, action: PayloadAction<JobItemCompletedEvent>) => {
            const { jobId, index, status, message, completedAt } = action.payload;
            if (!state.itemUpdates[jobId]) {
                state.itemUpdates[jobId] = [];
            }

            const newItem: JobProgressItem = {
                jobId,
                index,
                status,
                ...(message !== undefined && { message }),
                ...(completedAt !== undefined && { completedAt }),
            };

            const existingIndex = state.itemUpdates[jobId].findIndex(u => u.index === index);
            if (existingIndex !== -1) {
                const existing = state.itemUpdates[jobId][existingIndex];
                if (existing) {
                    state.itemUpdates[jobId][existingIndex] = {
                        ...existing,
                        status,
                        ...(message !== undefined && { message }),
                        ...(completedAt !== undefined && { completedAt }),
                    };
                }
            } else {
                state.itemUpdates[jobId].push(newItem);
            }

            const updates = state.itemUpdates[jobId];
            const completedCount = updates.filter(u => u.status === JobItemStatus.Success).length;
            const failedCount = updates.filter(u => u.status === JobItemStatus.Failed).length;

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.completedItems = completedCount;
                state.currentJob.failedItems = failedCount;
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.completedItems = completedCount;
                    job.failedItems = failedCount;
                }
            }
        },
        handleJobCompleted: (state, action: PayloadAction<{ jobId: string }>) => {
            const { jobId } = action.payload;

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = JobStatus.Completed;
                state.currentJob.completedAt = new Date().toISOString();
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.status = JobStatus.Completed;
                    job.completedAt = new Date().toISOString();
                }
            }
        },
        handleJobCanceled: (state, action: PayloadAction<{ jobId: string }>) => {
            const { jobId } = action.payload;

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = JobStatus.Canceled;
                state.currentJob.completedAt = new Date().toISOString();
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.status = JobStatus.Canceled;
                    job.completedAt = new Date().toISOString();
                }
            }
        },
        handleJobRetried: (state, action: PayloadAction<{ jobId: string }>) => {
            const { jobId } = action.payload;

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = JobStatus.Pending;
                delete state.currentJob.completedAt;
            }

            const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
            if (jobIndex !== -1) {
                const job = state.jobs[jobIndex];
                if (job) {
                    job.status = JobStatus.Pending;
                    delete job.completedAt;
                }
            }

            delete state.itemUpdates[jobId];
        },
        clearItemUpdates: (state, action: PayloadAction<string>) => {
            delete state.itemUpdates[action.payload];
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
                state.jobs = action.payload.jobs ?? [];
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

                // Populate itemUpdates from job items for items that have started processing
                const jobId = action.payload.jobId;
                const existingUpdates = state.itemUpdates[jobId] ?? [];
                const newUpdates: JobProgressItem[] = action.payload.items
                    .filter(item => item.status !== JobItemStatus.Pending)
                    .map(item => ({
                        jobId: item.jobId,
                        index: item.index,
                        status: item.status,
                        ...(item.errorMessage !== undefined && { message: item.errorMessage }),
                        ...(item.startedAt !== undefined && { startedAt: item.startedAt }),
                        ...(item.completedAt !== undefined && { completedAt: item.completedAt }),
                    }));

                // Merge: keep existing updates but add any missing items
                const existingIndices = new Set(existingUpdates.map(u => u.index));
                const mergedUpdates = [
                    ...existingUpdates,
                    ...newUpdates.filter(u => !existingIndices.has(u.index)),
                ];
                state.itemUpdates[jobId] = mergedUpdates;
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
                state.jobs = [action.payload, ...(state.jobs ?? [])];
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
                    state.currentJob.status = 'Canceled' as JobResponse['status'];
                }
                const jobIndex = state.jobs.findIndex(j => j.jobId === jobId);
                if (jobIndex !== -1) {
                    const job = state.jobs[jobIndex];
                    if (job) {
                        job.status = 'Canceled' as JobResponse['status'];
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
    addItemStarted,
    addItemCompleted,
    handleJobCompleted,
    handleJobCanceled,
    handleJobRetried,
    clearItemUpdates,
} = jobsSlice.actions;

export const selectJobs = (state: { jobs: JobsState }) => state.jobs.jobs;
export const selectTotalCount = (state: { jobs: JobsState }) => state.jobs.totalCount;
export const selectCurrentJob = (state: { jobs: JobsState }) => state.jobs.currentJob;
export const selectIsLoading = (state: { jobs: JobsState }) => state.jobs.isLoading;
export const selectIsSubmitting = (state: { jobs: JobsState }) => state.jobs.isSubmitting;
export const selectError = (state: { jobs: JobsState }) => state.jobs.error;
export const selectItemUpdates = (state: { jobs: JobsState }, jobId: string) =>
    state.jobs.itemUpdates[jobId] ?? [];

export default jobsSlice.reducer;
