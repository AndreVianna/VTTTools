namespace VttTools.Contracts.Game;

public record CreateMeetingRequest
    : Request {
    /// <summary>
    /// The subject of the new meeting.
    /// </summary>
    public string Subject { get; init; } = string.Empty;
    /// <summary>
    /// The initial Episode to activate when the meeting starts.
    /// </summary>
    [Required]
    public Guid EpisodeId { get; init; }
}