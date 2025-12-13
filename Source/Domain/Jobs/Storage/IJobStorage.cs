namespace VttTools.Jobs.Storage;

/// <summary>
/// Content-agnostic job storage interface for managing job lifecycle.
/// </summary>
public interface IJobStorage {
    /// <summary>
    /// Creates a new job with the specified parameters.
    /// </summary>
    /// <param name="type">The type of job to create.</param>
    /// <param name="inputJson">JSON-serialized input data for the job.</param>
    /// <param name="totalItems">Total number of items in the job.</param>
    /// <param name="estimatedDurationMs">Estimated duration in milliseconds.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The ID of the created job.</returns>
    Task<Guid> CreateJobAsync(
        string type,
        string inputJson,
        int totalItems,
        long? estimatedDurationMs = null,
        CancellationToken ct = default);

    /// <summary>
    /// Adds items to an existing job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="items">Collection of items with their index and JSON-serialized input data.</param>
    /// <param name="ct">Cancellation token.</param>
    Task AddItemsAsync(
        Guid jobId,
        IEnumerable<(int Index, string InputJson)> items,
        CancellationToken ct = default);

    /// <summary>
    /// Retrieves a job by its ID, including all items.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The job response if found; otherwise, null.</returns>
    Task<JobResponse?> GetJobByIdAsync(
        Guid jobId,
        CancellationToken ct = default);

    /// <summary>
    /// Retrieves a paginated list of jobs.
    /// </summary>
    /// <param name="type">Optional job type filter.</param>
    /// <param name="skip">Number of jobs to skip for pagination.</param>
    /// <param name="take">Number of jobs to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of jobs and total count.</returns>
    Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobsAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default);

    /// <summary>
    /// Updates the status of a job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="status">The new status.</param>
    /// <param name="startedAt">Optional started timestamp.</param>
    /// <param name="completedAt">Optional completed timestamp.</param>
    /// <param name="actualDurationMs">Optional actual duration in milliseconds.</param>
    /// <param name="ct">Cancellation token.</param>
    Task UpdateJobStatusAsync(
        Guid jobId,
        JobStatus status,
        DateTime? startedAt = null,
        DateTime? completedAt = null,
        long? actualDurationMs = null,
        CancellationToken ct = default);

    /// <summary>
    /// Updates the completed and failed item counts for a job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="completedItems">Number of completed items.</param>
    /// <param name="failedItems">Number of failed items.</param>
    /// <param name="ct">Cancellation token.</param>
    Task UpdateJobCountsAsync(
        Guid jobId,
        int completedItems,
        int failedItems,
        CancellationToken ct = default);

    /// <summary>
    /// Updates the status of a job item.
    /// </summary>
    /// <param name="itemId">The ID of the item.</param>
    /// <param name="status">The new status.</param>
    /// <param name="outputJson">Optional JSON-serialized output data.</param>
    /// <param name="errorMessage">Optional error message if the item failed.</param>
    /// <param name="startedAt">Optional started timestamp.</param>
    /// <param name="completedAt">Optional completed timestamp.</param>
    /// <param name="ct">Cancellation token.</param>
    Task UpdateItemStatusAsync(
        Guid itemId,
        JobItemStatus status,
        string? outputJson = null,
        string? errorMessage = null,
        DateTime? startedAt = null,
        DateTime? completedAt = null,
        CancellationToken ct = default);

    /// <summary>
    /// Retrieves all pending items for a job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of pending job items.</returns>
    Task<IReadOnlyList<JobItemResponse>> GetPendingItemsAsync(
        Guid jobId,
        CancellationToken ct = default);

    /// <summary>
    /// Retrieves failed items for a job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="itemIds">Optional array of specific item IDs to retrieve.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>List of failed job items.</returns>
    Task<IReadOnlyList<JobItemResponse>> GetFailedItemsAsync(
        Guid jobId,
        Guid[]? itemIds = null,
        CancellationToken ct = default);
}
