using VttTools.Media.Events;

namespace VttTools.Media.Hubs;

public interface IMediaHubClient {
    Task OnResourceUpdated(ResourceUpdatedEvent @event);
}