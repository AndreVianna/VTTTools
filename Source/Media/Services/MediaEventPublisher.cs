using VttTools.Media.Events;
using VttTools.Media.Hubs;

namespace VttTools.Media.Services;

public class MediaEventPublisher(IHubContext<MediaHub, IMediaHubClient> hubContext)
    : IMediaEventPublisher {
    public Task NotifyResourceUpdatedAsync(Guid resourceId, CancellationToken ct = default) {
        var @event = new ResourceUpdatedEvent {
            ResourceId = resourceId,
        };
        return hubContext.Clients.Group($"resource-{resourceId}").OnResourceUpdated(@event);
    }
}
