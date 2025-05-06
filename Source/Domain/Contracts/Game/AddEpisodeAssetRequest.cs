namespace VttTools.Contracts.Game;

public record AddEpisodeAssetRequest
    : Request {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Position Position { get; init; } = new();
    public double Scale { get; init; } = 1.0;
}