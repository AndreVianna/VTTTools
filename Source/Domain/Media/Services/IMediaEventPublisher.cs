namespace VttTools.Media.Services;

public interface IMediaEventPublisher {
    Task NotifyResourceUpdatedAsync(Guid resourceId, CancellationToken ct = default);
}
