namespace VttTools.WebApp.Contracts.Assets;

public record AssetDetails {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public AssetType Type { get; init; }
    public DisplayType DisplayType { get; init; }
    public string DisplayId { get; init; } = string.Empty;
    public Size Size { get; init; }
}
