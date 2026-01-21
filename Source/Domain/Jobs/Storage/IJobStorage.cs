namespace VttTools.Jobs.Storage;

public interface IJobStorage {
    Task AddAsync(Job job, CancellationToken ct = default);
    Task<Job?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Job> Jobs, int TotalCount)> SearchAsync(string? type = null, int skip = 0, int take = 20, CancellationToken ct = default);
    Task<bool> UpdateAsync(Job job, CancellationToken ct = default);
    Task<bool> CancelAsync(Guid id, CancellationToken ct = default);
    Task<bool> RetryAsync(Guid id, CancellationToken ct = default);
}