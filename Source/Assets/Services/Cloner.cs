namespace VttTools.Assets.Services;

public static class Cloner {
    internal static Asset Clone(this Asset original, Guid? ownerId = null)
        => new() {
            Name = original.Name,
            Description = original.Description,

            Classification = original.Classification,

            Size = original.Size,
            Tokens = original.Tokens.ConvertAll(v => v.Clone()),

            StatBlockEntries = original.StatBlockEntries.ToDictionary(
                keySelector: gameSystemEntry => gameSystemEntry.Key,
                elementSelector: gameSystemEntry => gameSystemEntry.Value.ToDictionary(
                    keySelector: levelEntry => levelEntry.Key,
                    elementSelector: levelEntry => new Map<StatEntry>(levelEntry.Value.ToDictionary(
                        keySelector: statEntry => statEntry.Key,
                        elementSelector: statEntry => statEntry.Value.Clone()
                    ))
                )
            ),

            Tags = [.. original.Tags],

            OwnerId = ownerId ?? original.OwnerId,
            IsPublic = original.IsPublic,
            IsPublished = original.IsPublished,
        };

    internal static ResourceMetadata Clone(this ResourceMetadata original)
        => new() {
            Id = original.Id,
            Path = original.Path,
            ContentType = original.ContentType,
            FileName = original.FileName,
            FileSize = original.FileSize,
            Dimensions = original.Dimensions,
            Duration = original.Duration,
        };

    internal static StatEntry Clone(this StatEntry original)
        => new() {
            AssetId = original.AssetId,
            GameSystemId = original.GameSystemId,
            GameSystemCode = original.GameSystemCode,
            Level = original.Level,
            Key = original.Key,
            Value = original.Value,
            Type = original.Type,
            Description = original.Description,
            Modifiers = original.Modifiers is null ? null : [.. original.Modifiers.Select(m => m.Clone())],
        };

    internal static StatModifier Clone(this StatModifier original)
        => new() {
            Condition = original.Condition,
            Source = original.Source,
            Bonus = original.Bonus,
        };
}