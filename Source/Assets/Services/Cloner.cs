namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => original switch {
            ObjectAsset obj => new ObjectAsset {
                OwnerId = ownerId ?? obj.OwnerId,
                Name = obj.Name,
                Description = obj.Description,
                Resources = [.. obj.Resources.Select(ar => ar.Clone())],
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = obj.Properties
            },
            CreatureAsset creature => new CreatureAsset {
                OwnerId = ownerId ?? creature.OwnerId,
                Name = creature.Name,
                Description = creature.Description,
                Resources = [.. creature.Resources.Select(ar => ar.Clone())],
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Properties = creature.Properties
            },
            _ => throw new InvalidOperationException($"Unknown asset type: {original.GetType()}")
        };

    internal static AssetResource Clone(this AssetResource original)
        => new() {
            ResourceId = original.ResourceId,
            Resource = original.Resource?.Clone(),
            Role = original.Role
        };

    internal static Resource Clone(this Resource original)
        => new() {
            Id = original.Id,
            Type = original.Type,
            Path = original.Path,
            Metadata = new() {
                ContentType = original.Metadata.ContentType,
                FileName = original.Metadata.FileName,
                FileLength = original.Metadata.FileLength,
                ImageSize = original.Metadata.ImageSize,
                Duration = original.Metadata.Duration,
            },
            Tags = [.. original.Tags],
        };
}