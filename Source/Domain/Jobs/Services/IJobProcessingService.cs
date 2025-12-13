namespace VttTools.Jobs.Services;

public interface IJobProcessingService {
    Task QueueJobAsync(Guid jobId, CancellationToken ct = default);
}
