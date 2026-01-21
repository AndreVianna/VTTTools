namespace VttTools.Data.Game.Entities;

public class Schedule {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    public Guid EventId { get; set; }
    public ICollection<Participant> Participants { get; set; } = [];
    public DateTimeOffset Start { get; set; }
    public TimeSpan Duration { get; set; }
    public Recurrence Recurrence { get; set; } = new();
}