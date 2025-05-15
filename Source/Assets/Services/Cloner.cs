namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset CloneAsset(Asset original, Guid ownerId, CloneAssetData data) {
        var clone = new Asset {
            OwnerId = ownerId,
            Name = $"{original.Name} (Copy)",
            Description = original.Description,
            Type = original.Type,
            Display = original.Display,
        };
        if (data.Name.IsSet) clone.Name = data.Name.Value;
        if (data.Description.IsSet) clone.Description = data.Description.Value;
        if (data.Display.IsSet) clone.Display = data.Display.Value;
        return clone;
    }
}