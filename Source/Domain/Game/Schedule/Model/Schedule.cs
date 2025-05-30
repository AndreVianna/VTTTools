namespace VttTools.Game.Schedule.Model;

public record Schedule {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid OwnerId { get; init; }
    public List<Participant> Participants { get; init; } = [];
    public Guid EventId { get; init; }
    public DateTimeOffset Start { get; init; }
    public TimeSpan Duration { get; init; }
    public Recurrence? Recurrence { get; init; }
}