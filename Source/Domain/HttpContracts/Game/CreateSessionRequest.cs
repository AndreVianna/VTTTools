namespace VttTools.HttpContracts.Game;

public record CreateSessionRequest
    : Request {
    public string Name { get; init; } = string.Empty;
}