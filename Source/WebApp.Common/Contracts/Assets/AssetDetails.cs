namespace VttTools.WebApp.Contracts.Assets;

public record AssetDetails {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public AssetType Type { get; init; }
    public string? FileName { get; init; }
    public ResourceType ResourceType { get; init; }
    public string DisplayId { get; init; } = string.Empty;
    public Size Size { get; init; }
}