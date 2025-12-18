namespace VttTools.Jobs.Services;

internal sealed class JobEventCollector {
    private readonly List<IJobEvent> _jobEvents = [];
    private readonly List<IJobItemEvent> _itemEvents = [];

    public void AddJobEvent(IJobEvent @event) => _jobEvents.Add(@event);
    public void AddItemEvent(IJobItemEvent @event) => _itemEvents.Add(@event);

    public async Task PublishAllAsync(IJobEventPublisher publisher, CancellationToken ct = default) {
        foreach (var @event in _jobEvents)
            await publisher.PublishJobEventAsync(@event, ct);
        foreach (var @event in _itemEvents)
            await publisher.PublishJobItemEventAsync(@event, ct);
    }
}
