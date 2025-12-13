namespace VttTools.Jobs.Services;

/// <summary>
/// Service interface for managing job lifecycle and operations.
/// </summary>
public interface IJobService {
    /// <summary>
    /// Creates a new job with the specified parameters.
    /// </summary>
    /// <param name="request">The job creation request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The ID of the created job.</returns>
    Task<Result<Guid>> CreateJobAsync(
        CreateJobRequest request,
        CancellationToken ct = default);

    /// <summary>
    /// Retrieves a job by its ID.
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
    /// <param name="request">The status update request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Success or error result.</returns>
    Task<Result> UpdateJobStatusAsync(
        Guid jobId,
        UpdateJobStatusRequest request,
        CancellationToken ct = default);

    /// <summary>
    /// Updates the completed and failed item counts for a job.
    /// </summary>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="request">The counts update request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Success or error result.</returns>
    Task<Result> UpdateJobCountsAsync(
        Guid jobId,
        UpdateJobCountsRequest request,
        CancellationToken ct = default);

    /// <summary>
    /// Updates the status of a job item.
    /// </summary>
    /// <param name="itemId">The ID of the item.</param>
    /// <param name="request">The item status update request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Success or error result.</returns>
    Task<Result> UpdateItemStatusAsync(
        Guid itemId,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default);

    /// <summary>
    /// Broadcasts a progress event for a job.
    /// </summary>
    /// <param name="request">The progress broadcast request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Success result.</returns>
    Task<Result> BroadcastProgressAsync(
        BroadcastProgressRequest request,
        CancellationToken ct = default);
}
