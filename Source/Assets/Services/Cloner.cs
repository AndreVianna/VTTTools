namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset CloneAsset(Asset original, Guid ownerId, CloneAssetData data)
        => new() {
            OwnerId = ownerId,
            Name = data.Name.IsSet ? data.Name.Value : $"{original.Name} (Copy)",
            Description = data.Description.IsSet ? data.Description.Value : original.Description,
            Display = data.Display.IsSet ? data.Display.Value : original.Display,
        };
}