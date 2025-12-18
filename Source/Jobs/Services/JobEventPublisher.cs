namespace VttTools.Jobs.Services;

public class JobEventPublisher(IHubContext<JobHub, IJobHubClient> hubContext)
    : IJobEventPublisher {
    public Task PublishJobEventAsync(IJobEvent jobEvent, CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{jobEvent.JobId}").PublishJobEvent(jobEvent);

    public Task PublishJobItemEventAsync(IJobItemEvent jobItemEvent, CancellationToken ct = default)
        => hubContext.Clients.Group($"job-{jobItemEvent.JobId}").PublishJobItemEvent(jobItemEvent);
}
