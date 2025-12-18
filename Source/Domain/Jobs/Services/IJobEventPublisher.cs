namespace VttTools.Jobs.Services;

public interface IJobEventPublisher {
    Task PublishJobEventAsync(IJobEvent jobEvent, CancellationToken ct = default);
    Task PublishJobItemEventAsync(IJobItemEvent jobItemEvent, CancellationToken ct = default);
}
