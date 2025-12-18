namespace VttTools.Jobs.Events;

public interface IJobEvent {
    string EventType { get; }
    Guid JobId { get; }
    DateTime OccurredAt { get; }
}