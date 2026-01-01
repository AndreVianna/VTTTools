namespace VttTools.Game.Sessions.ApiContracts;

public record CreateGameSessionRequest
    : Request {
    public string Title { get; init; } = string.Empty;
    public Guid EncounterId { get; init; }
}