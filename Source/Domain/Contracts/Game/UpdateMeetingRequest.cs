namespace VttTools.Contracts.Game;

public record UpdateMeetingRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public Guid? EpisodeId { get; init; }
}