namespace VttTools.Contracts.Game;

public record UpdateMeetingData
    : Data {
    public Optional<string> Subject { get; init; }
    public Optional<Guid> EpisodeId { get; init; }
}