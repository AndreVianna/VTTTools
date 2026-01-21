namespace VttTools.Jobs.Hubs;

public interface IJobHubClient {
    Task PublishJobEvent(IJobEvent jobEvent);
    Task PublishJobItemEvent(IJobItemEvent jobItemEvent);
}