namespace VttTools.HttpContracts.Game;

public record UpdateSessionRequest
    : Request {
    public string Name { get; init; } = string.Empty;
}