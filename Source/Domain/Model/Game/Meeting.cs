namespace VttTools.Model.Game;

public class Meeting {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Subject { get; set; } = string.Empty;
    public MeetingStatus Status { get; set; } = MeetingStatus.Draft;
    public List<MeetingPlayer> Players { get; set; } = [];
    public Guid? EpisodeId { get; set; }
    public List<MeetingMessage> Messages { get; set; } = [];
    public List<MeetingEvent> Events { get; set; } = [];
}