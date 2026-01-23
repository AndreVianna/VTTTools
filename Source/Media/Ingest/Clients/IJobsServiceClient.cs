namespace VttTools.Media.Ingest.Clients;

/// <summary>
/// Client for calling the Jobs service.
/// </summary>
public interface IJobsServiceClient {
    /// <summary>
    /// Create a new job.
    /// </summary>
    Task<Job?> AddAsync(Guid ownerId, AddJobRequest request, CancellationToken ct = default);

    /// <summary>
    /// Get a job by ID.
    /// </summary>
    Task<Job?> GetByIdAsync(Guid jobId, CancellationToken ct = default);

    /// <summary>
    /// Update a job.
    /// </summary>
    Task<bool> UpdateAsync(Guid jobId, UpdateJobRequest request, CancellationToken ct = default);
}
