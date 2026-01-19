import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, {
    clearError,
    clearCurrentJob,
    addItemStarted,
    addItemCompleted,
    handleJobCompleted,
    handleJobCanceled,
    handleJobRetried,
    clearItemUpdates,
    fetchJobHistory,
    fetchJobStatus,
    startBulkGeneration,
    cancelJob,
    retryJob,
    selectJobs,
    selectTotalCount,
    selectCurrentJob,
    selectIsLoading,
    selectIsSubmitting,
    selectError,
    selectItemUpdates,
    type JobsState,
} from './jobsSlice';
import { jobsService as _jobsService } from '@services/jobsService';
import { JobStatus, JobItemStatus, JobType } from '@/types/jobs';
import type { JobResponse, JobItemResponse } from '@/types/jobs';

vi.mock('@services/jobsService', () => ({
    jobsService: {
        getJobHistory: vi.fn(),
        getJobStatus: vi.fn(),
        startBulkGeneration: vi.fn(),
        cancelJob: vi.fn(),
        retryJob: vi.fn(),
    },
}));

const createMockJob = (overrides: Partial<JobResponse> = {}): JobResponse => ({
    jobId: 'job-123',
    jobType: JobType.BulkAssetPortraitGeneration,
    status: JobStatus.Pending,
    totalItems: 5,
    completedItems: 0,
    failedItems: 0,
    createdAt: '2024-01-01T00:00:00Z',
    items: [],
    ...overrides,
});

const createMockJobItem = (overrides: Partial<JobItemResponse> = {}): JobItemResponse => ({
    itemId: 'item-1',
    jobId: 'job-123',
    index: 0,
    status: JobItemStatus.Pending,
    ...overrides,
});

const createInitialState = (overrides: Partial<JobsState> = {}): JobsState => ({
    jobs: [],
    totalCount: 0,
    currentJob: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    itemUpdates: {},
    ...overrides,
});

describe('jobsSlice', () => {
    let initialState: JobsState;

    beforeEach(() => {
        initialState = createInitialState();
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            // Act
            const state = reducer(undefined, { type: 'unknown' });

            // Assert
            expect(state.jobs).toEqual([]);
            expect(state.totalCount).toBe(0);
            expect(state.currentJob).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.isSubmitting).toBe(false);
            expect(state.error).toBeNull();
            expect(state.itemUpdates).toEqual({});
        });
    });

    describe('sync reducers', () => {
        describe('clearError', () => {
            it('should set error to null', () => {
                // Arrange
                const state = createInitialState({ error: 'Some error message' });

                // Act
                const result = reducer(state, clearError());

                // Assert
                expect(result.error).toBeNull();
            });
        });

        describe('clearCurrentJob', () => {
            it('should set currentJob to null', () => {
                // Arrange
                const mockJob = createMockJob();
                const state = createInitialState({ currentJob: mockJob });

                // Act
                const result = reducer(state, clearCurrentJob());

                // Assert
                expect(result.currentJob).toBeNull();
            });
        });

        describe('addItemStarted', () => {
            it('should add new item with InProgress status', () => {
                // Arrange
                const state = createInitialState();
                const event = {
                    eventType: 'JobItemStarted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:01Z',
                };

                // Act
                const result = reducer(state, addItemStarted(event));

                // Assert
                const updates = result.itemUpdates['job-123']!;
                expect(updates).toHaveLength(1);
                expect(updates[0]).toEqual({
                    jobId: 'job-123',
                    index: 0,
                    status: JobItemStatus.InProgress,
                    occurredAt: '2024-01-01T00:00:01Z',
                    startedAt: '2024-01-01T00:00:01Z',
                });
            });

            it('should update existing item', () => {
                // Arrange
                const state = createInitialState({
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.Pending,
                            occurredAt: '2024-01-01T00:00:00Z',
                        }],
                    },
                });
                const event = {
                    eventType: 'JobItemStarted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:02Z',
                };

                // Act
                const result = reducer(state, addItemStarted(event));

                // Assert
                const updates = result.itemUpdates['job-123']!;
                expect(updates).toHaveLength(1);
                expect(updates[0]!.status).toBe(JobItemStatus.InProgress);
                expect(updates[0]!.occurredAt).toBe('2024-01-01T00:00:02Z');
            });

            it('should ignore older events by occurredAt', () => {
                // Arrange
                const state = createInitialState({
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.InProgress,
                            occurredAt: '2024-01-01T00:00:05Z',
                            startedAt: '2024-01-01T00:00:05Z',
                        }],
                    },
                });
                const olderEvent = {
                    eventType: 'JobItemStarted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:01Z',
                };

                // Act
                const result = reducer(state, addItemStarted(olderEvent));

                // Assert
                const updates = result.itemUpdates['job-123']!;
                expect(updates[0]!.occurredAt).toBe('2024-01-01T00:00:05Z');
            });

            it('should update currentJob status to InProgress when job matches', () => {
                // Arrange
                const mockJob = createMockJob({ status: JobStatus.Pending });
                const state = createInitialState({ currentJob: mockJob });
                const event = {
                    eventType: 'JobItemStarted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:01Z',
                };

                // Act
                const result = reducer(state, addItemStarted(event));

                // Assert
                expect(result.currentJob?.status).toBe(JobStatus.InProgress);
            });
        });

        describe('addItemCompleted', () => {
            it('should add completed item with Success status', () => {
                // Arrange
                const state = createInitialState();
                const event = {
                    eventType: 'JobItemCompleted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:02Z',
                    status: JobItemStatus.Success,
                    result: 'asset-456',
                };

                // Act
                const result = reducer(state, addItemCompleted(event));

                // Assert
                const updates = result.itemUpdates['job-123']!;
                expect(updates).toHaveLength(1);
                expect(updates[0]).toEqual({
                    jobId: 'job-123',
                    index: 0,
                    status: JobItemStatus.Success,
                    occurredAt: '2024-01-01T00:00:02Z',
                    completedAt: '2024-01-01T00:00:02Z',
                    result: 'asset-456',
                });
            });

            it('should update existing item preserving startedAt', () => {
                // Arrange
                const state = createInitialState({
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.InProgress,
                            occurredAt: '2024-01-01T00:00:01Z',
                            startedAt: '2024-01-01T00:00:01Z',
                        }],
                    },
                });
                const event = {
                    eventType: 'JobItemCompleted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:05Z',
                    status: JobItemStatus.Success,
                };

                // Act
                const result = reducer(state, addItemCompleted(event));

                // Assert
                const updates = result.itemUpdates['job-123']!;
                expect(updates[0]!.status).toBe(JobItemStatus.Success);
                expect(updates[0]!.startedAt).toBe('2024-01-01T00:00:01Z');
                expect(updates[0]!.completedAt).toBe('2024-01-01T00:00:05Z');
            });

            it('should update completed and failed counts on currentJob', () => {
                // Arrange
                const mockJob = createMockJob({
                    completedItems: 0,
                    failedItems: 0,
                });
                const state = createInitialState({
                    currentJob: mockJob,
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.InProgress,
                            occurredAt: '2024-01-01T00:00:01Z',
                        }],
                    },
                });
                const event = {
                    eventType: 'JobItemCompleted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:05Z',
                    status: JobItemStatus.Success,
                };

                // Act
                const result = reducer(state, addItemCompleted(event));

                // Assert
                expect(result.currentJob?.completedItems).toBe(1);
                expect(result.currentJob?.failedItems).toBe(0);
            });

            it('should update failed count when status is Failed', () => {
                // Arrange
                const mockJob = createMockJob({
                    completedItems: 0,
                    failedItems: 0,
                });
                const state = createInitialState({
                    currentJob: mockJob,
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.InProgress,
                            occurredAt: '2024-01-01T00:00:01Z',
                        }],
                    },
                });
                const event = {
                    eventType: 'JobItemCompleted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:05Z',
                    status: JobItemStatus.Failed,
                };

                // Act
                const result = reducer(state, addItemCompleted(event));

                // Assert
                expect(result.currentJob?.completedItems).toBe(0);
                expect(result.currentJob?.failedItems).toBe(1);
            });

            it('should update counts in jobs list', () => {
                // Arrange
                const mockJob = createMockJob();
                const state = createInitialState({
                    jobs: [mockJob],
                    itemUpdates: {},
                });
                const event = {
                    eventType: 'JobItemCompleted' as const,
                    jobId: 'job-123',
                    index: 0,
                    occurredAt: '2024-01-01T00:00:05Z',
                    status: JobItemStatus.Success,
                };

                // Act
                const result = reducer(state, addItemCompleted(event));

                // Assert
                expect(result.jobs[0]?.completedItems).toBe(1);
            });
        });

        describe('handleJobCompleted', () => {
            it('should update job status to Completed and set completedAt', () => {
                // Arrange
                const mockJob = createMockJob({ status: JobStatus.InProgress });
                const state = createInitialState({
                    currentJob: mockJob,
                    jobs: [mockJob],
                });

                // Act
                const result = reducer(state, handleJobCompleted({ jobId: 'job-123' }));

                // Assert
                expect(result.currentJob?.status).toBe(JobStatus.Completed);
                expect(result.currentJob?.completedAt).toBeDefined();
                expect(result.jobs[0]?.status).toBe(JobStatus.Completed);
                expect(result.jobs[0]?.completedAt).toBeDefined();
            });
        });

        describe('handleJobCanceled', () => {
            it('should update job status to Canceled and set completedAt', () => {
                // Arrange
                const mockJob = createMockJob({ status: JobStatus.InProgress });
                const state = createInitialState({
                    currentJob: mockJob,
                    jobs: [mockJob],
                });

                // Act
                const result = reducer(state, handleJobCanceled({ jobId: 'job-123' }));

                // Assert
                expect(result.currentJob?.status).toBe(JobStatus.Canceled);
                expect(result.currentJob?.completedAt).toBeDefined();
                expect(result.jobs[0]?.status).toBe(JobStatus.Canceled);
                expect(result.jobs[0]?.completedAt).toBeDefined();
            });
        });

        describe('handleJobRetried', () => {
            it('should reset job to Pending and remove completedAt', () => {
                // Arrange
                const mockJob = createMockJob({
                    status: JobStatus.Completed,
                    completedAt: '2024-01-01T00:01:00Z',
                });
                const state = createInitialState({
                    currentJob: mockJob,
                    jobs: [mockJob],
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.Success,
                            occurredAt: '2024-01-01T00:00:30Z',
                        }],
                    },
                });

                // Act
                const result = reducer(state, handleJobRetried({ jobId: 'job-123' }));

                // Assert
                expect(result.currentJob?.status).toBe(JobStatus.Pending);
                expect(result.currentJob?.completedAt).toBeUndefined();
                expect(result.jobs[0]?.status).toBe(JobStatus.Pending);
                expect(result.jobs[0]?.completedAt).toBeUndefined();
                expect(result.itemUpdates['job-123']).toBeUndefined();
            });
        });

        describe('clearItemUpdates', () => {
            it('should remove item updates for job', () => {
                // Arrange
                const state = createInitialState({
                    itemUpdates: {
                        'job-123': [{
                            jobId: 'job-123',
                            index: 0,
                            status: JobItemStatus.Success,
                            occurredAt: '2024-01-01T00:00:30Z',
                        }],
                        'job-456': [{
                            jobId: 'job-456',
                            index: 0,
                            status: JobItemStatus.InProgress,
                            occurredAt: '2024-01-01T00:00:10Z',
                        }],
                    },
                });

                // Act
                const result = reducer(state, clearItemUpdates('job-123'));

                // Assert
                expect(result.itemUpdates['job-123']).toBeUndefined();
                expect(result.itemUpdates['job-456']).toBeDefined();
            });
        });
    });

    describe('async thunks', () => {
        describe('fetchJobHistory', () => {
            it('should set isLoading true on pending', () => {
                // Arrange
                const action = { type: fetchJobHistory.pending.type };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(true);
                expect(result.error).toBeNull();
            });

            it('should set jobs and totalCount on fulfilled', () => {
                // Arrange
                const mockJobs = [createMockJob(), createMockJob({ jobId: 'job-456' })];
                const action = {
                    type: fetchJobHistory.fulfilled.type,
                    payload: { jobs: mockJobs, totalCount: 10 },
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(false);
                expect(result.jobs).toEqual(mockJobs);
                expect(result.totalCount).toBe(10);
            });

            it('should set error on rejected', () => {
                // Arrange
                const action = {
                    type: fetchJobHistory.rejected.type,
                    payload: 'Failed to fetch job history',
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(false);
                expect(result.error).toBe('Failed to fetch job history');
            });
        });

        describe('fetchJobStatus', () => {
            it('should set isLoading true on pending', () => {
                // Arrange
                const action = { type: fetchJobStatus.pending.type };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(true);
                expect(result.error).toBeNull();
            });

            it('should set currentJob and build itemUpdates on fulfilled', () => {
                // Arrange
                const mockItems: JobItemResponse[] = [
                    createMockJobItem({ index: 0, status: JobItemStatus.Success }),
                    createMockJobItem({ index: 1, status: JobItemStatus.InProgress }),
                ];
                const mockJob = createMockJob({
                    totalItems: 3,
                    items: mockItems,
                });
                const action = {
                    type: fetchJobStatus.fulfilled.type,
                    payload: mockJob,
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(false);
                expect(result.currentJob).toEqual(mockJob);
                const updates = result.itemUpdates['job-123']!;
                expect(updates).toHaveLength(3);
                expect(updates[0]!.status).toBe(JobItemStatus.Success);
                expect(updates[1]!.status).toBe(JobItemStatus.InProgress);
                expect(updates[2]!.status).toBe(JobItemStatus.Pending);
            });

            it('should preserve existing SignalR updates on fulfilled', () => {
                // Arrange
                const existingUpdate = {
                    jobId: 'job-123',
                    index: 0,
                    status: JobItemStatus.Success,
                    occurredAt: '2024-01-01T00:00:30Z',
                    completedAt: '2024-01-01T00:00:30Z',
                };
                const state = createInitialState({
                    itemUpdates: {
                        'job-123': [existingUpdate],
                    },
                });
                const mockItems: JobItemResponse[] = [
                    createMockJobItem({ index: 0, status: JobItemStatus.InProgress }),
                ];
                const mockJob = createMockJob({
                    totalItems: 2,
                    items: mockItems,
                });
                const action = {
                    type: fetchJobStatus.fulfilled.type,
                    payload: mockJob,
                };

                // Act
                const result = reducer(state, action);

                // Assert
                expect(result.itemUpdates['job-123']![0]).toEqual(existingUpdate);
            });

            it('should set error on rejected', () => {
                // Arrange
                const action = {
                    type: fetchJobStatus.rejected.type,
                    payload: 'Failed to fetch job status',
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isLoading).toBe(false);
                expect(result.error).toBe('Failed to fetch job status');
            });
        });

        describe('startBulkGeneration', () => {
            it('should set isSubmitting true on pending', () => {
                // Arrange
                const action = { type: startBulkGeneration.pending.type };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(true);
                expect(result.error).toBeNull();
            });

            it('should add job to list and initialize pending items on fulfilled', () => {
                // Arrange
                const mockJob = createMockJob({ totalItems: 3 });
                const action = {
                    type: startBulkGeneration.fulfilled.type,
                    payload: mockJob,
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.currentJob).toEqual(mockJob);
                expect(result.jobs).toHaveLength(1);
                expect(result.jobs[0]).toEqual(mockJob);
                expect(result.totalCount).toBe(1);
                const updates = result.itemUpdates['job-123']!;
                expect(updates).toHaveLength(3);
                expect(updates[0]!.status).toBe(JobItemStatus.Pending);
                expect(updates[1]!.status).toBe(JobItemStatus.Pending);
                expect(updates[2]!.status).toBe(JobItemStatus.Pending);
            });

            it('should prepend new job to existing jobs list', () => {
                // Arrange
                const existingJob = createMockJob({ jobId: 'job-existing' });
                const state = createInitialState({
                    jobs: [existingJob],
                    totalCount: 1,
                });
                const newJob = createMockJob({ jobId: 'job-new', totalItems: 2 });
                const action = {
                    type: startBulkGeneration.fulfilled.type,
                    payload: newJob,
                };

                // Act
                const result = reducer(state, action);

                // Assert
                expect(result.jobs).toHaveLength(2);
                expect(result.jobs[0]?.jobId).toBe('job-new');
                expect(result.jobs[1]?.jobId).toBe('job-existing');
                expect(result.totalCount).toBe(2);
            });

            it('should set error on rejected', () => {
                // Arrange
                const action = {
                    type: startBulkGeneration.rejected.type,
                    payload: 'Failed to start bulk generation',
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.error).toBe('Failed to start bulk generation');
            });
        });

        describe('cancelJob', () => {
            it('should set isSubmitting true on pending', () => {
                // Arrange
                const action = { type: cancelJob.pending.type };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(true);
                expect(result.error).toBeNull();
            });

            it('should update job status to Canceled on fulfilled', () => {
                // Arrange
                const mockJob = createMockJob({ status: JobStatus.InProgress });
                const state = createInitialState({
                    currentJob: mockJob,
                    jobs: [mockJob],
                });
                const action = {
                    type: cancelJob.fulfilled.type,
                    payload: 'job-123',
                };

                // Act
                const result = reducer(state, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.currentJob?.status).toBe('Canceled');
                expect(result.jobs[0]?.status).toBe('Canceled');
            });

            it('should set error on rejected', () => {
                // Arrange
                const action = {
                    type: cancelJob.rejected.type,
                    payload: 'Failed to cancel job',
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.error).toBe('Failed to cancel job');
            });
        });

        describe('retryJob', () => {
            it('should set isSubmitting true on pending', () => {
                // Arrange
                const action = { type: retryJob.pending.type };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(true);
                expect(result.error).toBeNull();
            });

            it('should update job in list on fulfilled', () => {
                // Arrange
                const oldJob = createMockJob({
                    status: JobStatus.Completed,
                    completedItems: 5,
                });
                const state = createInitialState({
                    jobs: [oldJob],
                });
                const retriedJob = createMockJob({
                    status: JobStatus.Pending,
                    completedItems: 0,
                });
                const action = {
                    type: retryJob.fulfilled.type,
                    payload: retriedJob,
                };

                // Act
                const result = reducer(state, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.currentJob).toEqual(retriedJob);
                expect(result.jobs[0]).toEqual(retriedJob);
            });

            it('should set error on rejected', () => {
                // Arrange
                const action = {
                    type: retryJob.rejected.type,
                    payload: 'Failed to retry job',
                };

                // Act
                const result = reducer(initialState, action);

                // Assert
                expect(result.isSubmitting).toBe(false);
                expect(result.error).toBe('Failed to retry job');
            });
        });
    });

    describe('selectors', () => {
        const mockRootState = (jobsState: JobsState) => ({ jobs: jobsState });

        describe('selectJobs', () => {
            it('should return jobs array', () => {
                // Arrange
                const mockJobs = [createMockJob(), createMockJob({ jobId: 'job-456' })];
                const state = mockRootState(createInitialState({ jobs: mockJobs }));

                // Act
                const result = selectJobs(state);

                // Assert
                expect(result).toEqual(mockJobs);
            });
        });

        describe('selectTotalCount', () => {
            it('should return totalCount', () => {
                // Arrange
                const state = mockRootState(createInitialState({ totalCount: 42 }));

                // Act
                const result = selectTotalCount(state);

                // Assert
                expect(result).toBe(42);
            });
        });

        describe('selectCurrentJob', () => {
            it('should return currentJob', () => {
                // Arrange
                const mockJob = createMockJob();
                const state = mockRootState(createInitialState({ currentJob: mockJob }));

                // Act
                const result = selectCurrentJob(state);

                // Assert
                expect(result).toEqual(mockJob);
            });

            it('should return null when no current job', () => {
                // Arrange
                const state = mockRootState(createInitialState());

                // Act
                const result = selectCurrentJob(state);

                // Assert
                expect(result).toBeNull();
            });
        });

        describe('selectIsLoading', () => {
            it('should return isLoading', () => {
                // Arrange
                const state = mockRootState(createInitialState({ isLoading: true }));

                // Act
                const result = selectIsLoading(state);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe('selectIsSubmitting', () => {
            it('should return isSubmitting', () => {
                // Arrange
                const state = mockRootState(createInitialState({ isSubmitting: true }));

                // Act
                const result = selectIsSubmitting(state);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe('selectError', () => {
            it('should return error', () => {
                // Arrange
                const state = mockRootState(createInitialState({ error: 'Test error' }));

                // Act
                const result = selectError(state);

                // Assert
                expect(result).toBe('Test error');
            });

            it('should return null when no error', () => {
                // Arrange
                const state = mockRootState(createInitialState());

                // Act
                const result = selectError(state);

                // Assert
                expect(result).toBeNull();
            });
        });

        describe('selectItemUpdates', () => {
            it('should return updates for job', () => {
                // Arrange
                const updates = [{
                    jobId: 'job-123',
                    index: 0,
                    status: JobItemStatus.Success,
                    occurredAt: '2024-01-01T00:00:30Z',
                }];
                const state = mockRootState(createInitialState({
                    itemUpdates: { 'job-123': updates },
                }));

                // Act
                const result = selectItemUpdates(state, 'job-123');

                // Assert
                expect(result).toEqual(updates);
            });

            it('should return empty array when no updates for job', () => {
                // Arrange
                const state = mockRootState(createInitialState());

                // Act
                const result = selectItemUpdates(state, 'non-existent-job');

                // Assert
                expect(result).toEqual([]);
            });
        });
    });
});
