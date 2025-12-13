namespace VttTools.Jobs.Services;

public interface IJobWorkHandler {
    string JobType { get; }
    Task<JobItemResult> ProcessItemAsync(string provider, string model, JobItemContext context, CancellationToken ct);
}