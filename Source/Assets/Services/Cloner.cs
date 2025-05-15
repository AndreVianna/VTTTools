namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset CloneAsset(Asset original, Guid ownerId, CloneAssetData data) {
        var clone = new Asset {
            OwnerId = ownerId,
            Name = $"{original.Name} (Copy)",
            Description = original.Description,
            Type = original.Type,
            Format = original.Format,
        };
        if (data.Name.IsSet) clone.Name = data.Name.Value;
        if (data.Description.IsSet) clone.Description = data.Description.Value;
        if (data.Format.IsSet) clone.Format = data.Format.Value;
        return clone;
    }
}