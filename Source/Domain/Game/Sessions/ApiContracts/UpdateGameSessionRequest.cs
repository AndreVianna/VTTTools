namespace VttTools.Game.Sessions.ApiContracts;

public record UpdateGameSessionRequest
    : Request {
    public Optional<string> Title { get; init; }
    public Optional<Guid> EncounterId { get; init; }
}