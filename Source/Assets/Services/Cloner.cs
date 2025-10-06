namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => new() {
            OwnerId = ownerId ?? original.OwnerId,
            Name = original.Name,
            Type = original.Type,
            Category = original.Category,
            Description = original.Description,
            Resource = original.Resource?.Clone(),
            IsPublic = original.IsPublic,
            IsPublished = original.IsPublished,
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