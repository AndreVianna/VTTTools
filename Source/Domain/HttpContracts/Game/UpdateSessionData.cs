namespace VttTools.HttpContracts.Game;

public record UpdateSessionData
    : Data {
    public string Name { get; init; } = string.Empty;
}
