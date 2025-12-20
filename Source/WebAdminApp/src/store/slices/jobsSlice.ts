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
            const { jobId, index, occurredAt } = action.payload;
            if (!state.itemUpdates[jobId]) {
                state.itemUpdates[jobId] = [];
            }

            const progressItem: JobProgressItem = {
                jobId,
                index,
                status: JobItemStatus.InProgress,
                occurredAt,
                startedAt: occurredAt,
            };

            const existingIndex = state.itemUpdates[jobId].findIndex(u => u.index === index);
            if (existingIndex !== -1) {
                const existing = state.itemUpdates[jobId][existingIndex];
                if (existing && existing.occurredAt && occurredAt <= existing.occurredAt) {
                    return;
                }
                state.itemUpdates[jobId][existingIndex] = progressItem;
            } else {
                state.itemUpdates[jobId].push(progressItem);
            }

            if (state.currentJob?.jobId === jobId) {
                state.currentJob.status = JobStatus.InProgress;
            }
        },
        addItemCompleted: (state, action: PayloadAction<JobItemCompletedEvent>) => {
            const { jobId, index, occurredAt, status, result } = action.payload;
            if (!state.itemUpdates[jobId]) {
                state.itemUpdates[jobId] = [];
            }

            const newItem: JobProgressItem = {
                jobId,
                index,
                status,
                occurredAt,
                completedAt: occurredAt,
                ...(result !== undefined && { result }),
            };

            const existingIndex = state.itemUpdates[jobId].findIndex(u => u.index === index);
            if (existingIndex !== -1) {
                const existing = state.itemUpdates[jobId][existingIndex];
                if (existing && existing.occurredAt && occurredAt <= existing.occurredAt) {
                    return;
                }
                if (existing) {
                    state.itemUpdates[jobId][existingIndex] = {
                        ...existing,
                        status,
                        occurredAt,
                        completedAt: occurredAt,
                        ...(result !== undefined && { result }),
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

                const jobId = action.payload.jobId;
                const totalItems = action.payload.totalItems;
                const existingUpdates = state.itemUpdates[jobId] ?? [];

                // Create a map of existing updates by index
                const existingMap = new Map(existingUpdates.map(u => [u.index, u]));

                // Build complete list with all items (including pending)
                const allUpdates: JobProgressItem[] = [];
                for (let i = 0; i < totalItems; i++) {
                    // Check if we have an existing update (from SignalR events)
                    const existing = existingMap.get(i);
                    // Check if we have item data from the API
                    const apiItem = action.payload.items.find(item => item.index === i);

                    if (existing) {
                        // Keep existing update (likely more up-to-date from SignalR)
                        allUpdates.push(existing);
                    } else if (apiItem) {
                        // Use API data
                        allUpdates.push({
                            jobId: apiItem.jobId,
                            index: apiItem.index,
                            status: apiItem.status,
                            ...(apiItem.result !== undefined && { result: apiItem.result }),
                            ...(apiItem.startedAt !== undefined && { startedAt: apiItem.startedAt }),
                            ...(apiItem.completedAt !== undefined && { completedAt: apiItem.completedAt }),
                        });
                    } else {
                        // Create pending item
                        allUpdates.push({
                            jobId,
                            index: i,
                            status: JobItemStatus.Pending,
                        });
                    }
                }
                state.itemUpdates[jobId] = allUpdates;
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

                // Initialize all items with pending status
                const jobId = action.payload.jobId;
                const totalItems = action.payload.totalItems;
                const pendingItems: JobProgressItem[] = [];
                for (let i = 0; i < totalItems; i++) {
                    pendingItems.push({
                        jobId,
                        index: i,
                        status: JobItemStatus.Pending,
                    });
                }
                state.itemUpdates[jobId] = pendingItems;
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
