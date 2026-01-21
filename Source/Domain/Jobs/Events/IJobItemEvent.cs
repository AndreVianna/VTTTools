namespace VttTools.Jobs.Events;

public interface IJobItemEvent : IJobEvent {
    int Index { get; }
}