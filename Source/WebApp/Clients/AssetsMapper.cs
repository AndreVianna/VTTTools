namespace VttTools.WebApp.Clients;

public static class AssetsMapper {
    internal static AssetListItem ToListItem(this Asset asset)
        => new() {
            Id = asset.Id,
            Name = asset.Name,
            Type = asset.Type,
        };
}