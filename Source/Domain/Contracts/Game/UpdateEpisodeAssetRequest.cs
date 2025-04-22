namespace VttTools.Contracts.Game;

public record UpdateEpisodeAssetRequest
    : Request {
    public Optional<Position> Position { get; init; } = Optional<Position>.None;
}
