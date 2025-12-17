namespace VttTools.Jobs.Services;

public interface IJobService {
    Task<Result<Job>> AddAsync(AddJobData data, CancellationToken ct = default);
    Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Job> Jobs, int TotalCount)> SearchAsync(string? type = null, int skip = 0, int take = 20, CancellationToken ct = default);
    Task<Result<Job>> UpdateAsync(UpdateJobData data, CancellationToken ct = default);
    Task<bool> CancelAsync(Guid id, CancellationToken ct = default);
    Task<bool> RetryAsync(Guid id, CancellationToken ct = default);
}
