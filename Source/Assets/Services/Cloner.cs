namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => original switch {
            ObjectAsset obj => new ObjectAsset {
                OwnerId = ownerId ?? obj.OwnerId,
                Name = obj.Name,
                Description = obj.Description,
                Tokens = [.. obj.Tokens.Select(ar => ar.Clone())],
                Portrait = obj.Portrait?.Clone(),
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                Size = obj.Size,
                IsMovable = obj.IsMovable,
                IsOpaque = obj.IsOpaque,
                TriggerEffectId = obj.TriggerEffectId,
            },
            CreatureAsset creature => new CreatureAsset {
                OwnerId = ownerId ?? creature.OwnerId,
                Name = creature.Name,
                Description = creature.Description,
                Tokens = [.. creature.Tokens.Select(ar => ar.Clone())],
                Portrait = creature.Portrait?.Clone(),
                IsPublic = creature.IsPublic,
                IsPublished = creature.IsPublished,
                Size = creature.Size,
                StatBlockId = creature.StatBlockId,
                Category = creature.Category,
                TokenStyle = creature.TokenStyle,
            },
            _ => throw new InvalidOperationException($"Unknown asset type: {original.GetType()}")
        };

    internal static AssetToken Clone(this AssetToken original)
        => new() {
            Token = original.Token.Clone(),
            IsDefault = original.IsDefault
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