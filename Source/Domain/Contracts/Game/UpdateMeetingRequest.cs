namespace VttTools.Contracts.Game;

public record UpdateMeetingRequest
    : Request {
    /// <summary>
    /// New subject for the meeting. If not set, subject is unchanged.
    /// </summary>
    public Optional<string> Subject { get; init; }
    /// <summary>
    /// New episode for the meeting. If not set, episode is unchanged.
    /// </summary>
    public Optional<Guid> EpisodeId { get; init; }
}