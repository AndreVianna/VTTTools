namespace VttTools.AI.Clients;

public interface IJobsServiceClient {
    Task<Job?> AddAsync(AddJobRequest request, CancellationToken ct = default);
    Task<Job?> GetByIdAsync(Guid jobId, CancellationToken ct = default);
    Task<bool> UpdateAsync(Guid jobId, UpdateJobRequest request, CancellationToken ct = default);
}