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
            MonsterAsset monster => new MonsterAsset {
                OwnerId = ownerId ?? monster.OwnerId,
                Name = monster.Name,
                Description = monster.Description,
                Tokens = [.. monster.Tokens.Select(ar => ar.Clone())],
                Portrait = monster.Portrait?.Clone(),
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
                Tokens = [.. character.Tokens.Select(ar => ar.Clone())],
                Portrait = character.Portrait?.Clone(),
                IsPublic = character.IsPublic,
                IsPublished = character.IsPublished,
                Size = character.Size,
                StatBlockId = character.StatBlockId,
                TokenStyle = character.TokenStyle,
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