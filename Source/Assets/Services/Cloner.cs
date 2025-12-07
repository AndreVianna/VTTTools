namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => new() {
            Name = original.Name,
            Description = original.Description,

            Classification = original.Classification,

            Portrait = original.Portrait?.Clone(),
            TokenSize = original.TokenSize,
            Tokens = original.Tokens.ConvertAll(v => v.Clone()),

            StatBlocks = original.StatBlocks.ToDictionary(keySelector: k => k.Key, elementSelector: k => k.Value),

            OwnerId = ownerId ?? original.OwnerId,
            IsPublic = original.IsPublic,
            IsPublished = original.IsPublished,
        };

    internal static ResourceMetadata Clone(this ResourceMetadata original)
        => new() {
            Id = original.Id,
            Description = original.Description,

            Path = original.Path,
            ResourceType = original.ResourceType,
            ContentType = original.ContentType,
            FileName = original.FileName,
            FileLength = original.FileLength,
            Size = original.Size,
            Duration = original.Duration,
            Features = [.. original.Features],

            OwnerId = original.OwnerId,
            IsPublic = original.IsPublic,
            IsPublished = original.IsPublished,
        };
}