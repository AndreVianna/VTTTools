namespace VttTools.WebApp.Contracts.Assets;

public record AssetDetails {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public AssetType Type { get; init; }
    public string? FileName { get; init; }
    public ResourceType DisplayType { get; init; }
    public string DisplayPath { get; init; } = string.Empty;
    public Size DisplaySize { get; init; }
}