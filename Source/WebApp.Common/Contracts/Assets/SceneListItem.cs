namespace VttTools.WebApp.Contracts.Assets;

public sealed record AssetListItem {
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public AssetType Type { get; set; }
}
