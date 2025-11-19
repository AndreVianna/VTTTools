namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => original switch {
            ObjectAsset obj => new ObjectAsset {
                OwnerId = ownerId ?? obj.OwnerId,
                Name = obj.Name,
                Description = obj.Description,
                Portrait = obj.Portrait?.Clone(),
                TopDown = obj.TopDown?.Clone(),
                Miniature = obj.Miniature?.Clone(),
                Photo = obj.Photo?.Clone(),
                IsPublic = obj.IsPublic,
                IsPublished = obj.IsPublished,
                Size = obj.Size,
                IsMovable = obj.IsMovable,
                IsOpaque = obj.IsOpaque,
                TriggerEffectId = obj.TriggerEffectId,
            },
            MonsterAsset monster => new MonsterAsset {
                OwnerId = ownerId ?? monster.OwnerId,
                Name = monster.Name,
                Description = monster.Description,
                Portrait = monster.Portrait?.Clone(),
                TopDown = monster.TopDown?.Clone(),
                Miniature = monster.Miniature?.Clone(),
                Photo = monster.Photo?.Clone(),
                IsPublic = monster.IsPublic,
                IsPublished = monster.IsPublished,
                Size = monster.Size,
                StatBlockId = monster.StatBlockId,
                TokenStyle = monster.TokenStyle,
            },
            CharacterAsset character => new CharacterAsset {
                OwnerId = ownerId ?? character.OwnerId,
                Name = character.Name,
                Description = character.Description,
                Portrait = character.Portrait?.Clone(),
                TopDown = character.TopDown?.Clone(),
                Miniature = character.Miniature?.Clone(),
                Photo = character.Photo?.Clone(),
                IsPublic = character.IsPublic,
                IsPublished = character.IsPublished,
                Size = character.Size,
                StatBlockId = character.StatBlockId,
                TokenStyle = character.TokenStyle,
            },
            _ => throw new InvalidOperationException($"Unknown asset type: {original.GetType()}")
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