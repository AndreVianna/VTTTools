namespace VttTools.HttpContracts.Game;

public record CreateSessionData
    : Data {
    public string Name { get; init; } = string.Empty;
}