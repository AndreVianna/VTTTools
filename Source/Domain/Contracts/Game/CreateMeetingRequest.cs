namespace VttTools.Contracts.Game;

public record CreateMeetingRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    /// <summary>
    /// The initial Episode to activate when the meeting starts.
    /// </summary>
    [Required]
    public Guid EpisodeId { get; init; }
}