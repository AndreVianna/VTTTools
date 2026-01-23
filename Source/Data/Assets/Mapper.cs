using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using AssetResourceEntity = VttTools.Data.Assets.Entities.AssetToken;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;
using StatEntry = VttTools.Assets.Model.StatEntry;
using StatEntryType = VttTools.Assets.Model.StatEntryType;
using StatModifier = VttTools.Assets.Model.StatModifier;

namespace VttTools.Data.Assets;

internal static class Mapper {
    public static Expression<Func<AssetEntity, Asset>> AsAsset = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Classification = new(entity.Kind, entity.Category, entity.Type, entity.Subtype),
            Name = entity.Name,
            Description = entity.Description,
            Size = entity.Size,
            StatBlockEntries = entity.StatBlockEntries.GroupBy(e => e.GameSystemId)
                .ToDictionary(
                    gs => gs.Key,
                    gs => gs.GroupBy(e => e.Level)
                        .ToDictionary(
                            lvl => lvl.Key,
                            lvl => new Map<StatEntry>(lvl.ToDictionary(
                                e => e.Key,
                                e => new StatEntry {
                                    AssetId = entity.Id,
                                    GameSystemId = e.GameSystemId,
                                    GameSystemCode = e.GameSystem.Code,
                                    Level = e.Level,
                                    Key = e.Key,
                                    Value = e.Value,
                                    Type = (StatEntryType)e.Type,
                                    Description = e.Description,
                                    Modifiers = e.Modifiers != null ? JsonSerializer.Deserialize<StatModifier[]>(e.Modifiers) : null,
                                })))),
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            IsDeleted = entity.IsDeleted,
            IngestStatus = entity.IngestStatus,
            AiPrompt = entity.AiPrompt,
            Tags = entity.Tags,
            Tokens = entity.Tokens.AsQueryable().OrderBy(r => r.Index).Select(AsResourceToken!).ToList(),
        };

    [return: NotNullIfNotNull(nameof(entity))]
    public static Asset? ToModel(this AssetEntity? entity)
        => entity is null
           ? null
           : new Asset {
               Id = entity.Id,
               OwnerId = entity.OwnerId,
               Classification = new(entity.Kind, entity.Category, entity.Type, entity.Subtype),
               Name = entity.Name,
               Description = entity.Description,
               IsPublic = entity.IsPublic,
               IsPublished = entity.IsPublished,
               IsDeleted = entity.IsDeleted,
               IngestStatus = entity.IngestStatus,
               AiPrompt = entity.AiPrompt,
               Tags = entity.Tags,
               Size = entity.Size,
               StatBlockEntries = entity.StatBlockEntries.GroupBy(e => e.GameSystemId)
                    .ToDictionary(
                        gs => gs.Key,
                        gs => gs.GroupBy(e => e.Level)
                            .ToDictionary(
                                lvl => lvl.Key,
                                lvl => new Map<StatEntry>(lvl.ToDictionary(
                                    e => e.Key,
                                    e => new StatEntry {
                                        AssetId = entity.Id,
                                        GameSystemId = e.GameSystemId,
                                        GameSystemCode = e.GameSystem.Code,
                                        Level = e.Level,
                                        Key = e.Key,
                                        Value = e.Value,
                                        Type = (StatEntryType)e.Type,
                                        Description = e.Description,
                                        Modifiers = DeserializeModifiers(e.Modifiers),
                                    })))),
               Tokens = [.. entity.Tokens.OrderBy(r => r.Index).Select(r => r.Token.ToModel())],
           };

    public static AssetEntity ToEntity(this Asset model) {
        var statEntries = model.StatBlockEntries.SelectMany(gs => gs.Value.SelectMany(lvl => lvl.Value.Select(entry => new AssetStatEntry {
            AssetId = model.Id,
            GameSystemId = entry.Value.GameSystemId,
            Level = entry.Value.Level,
            Key = entry.Value.Key,
            Type = (AssetStatEntryType)entry.Value.Type,
            Value = entry.Value.Value,
            Description = entry.Value.Description,
            Modifiers = SerializeModifiers(entry.Value.Modifiers),
        })));

        var entity = new AssetEntity {
            Id = model.Id,
            OwnerId = model.OwnerId,
            Kind = model.Classification.Kind,
            Category = model.Classification.Category,
            Type = model.Classification.Type,
            Subtype = model.Classification.Subtype,
            Name = model.Name,
            Description = model.Description,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
            IsDeleted = model.IsDeleted,
            IngestStatus = model.IngestStatus,
            AiPrompt = model.AiPrompt,
            Tags = model.Tags,
            Size = model.Size,
            Tokens = [.. model.Tokens.Select((t, i) => new AssetResourceEntity {
                AssetId = model.Id,
                TokenId = t.Id,
                Index = i,
            })],
            StatBlockEntries = [.. statEntries],
        };
        return entity;
    }

    public static void UpdateFrom(this AssetEntity entity, Asset model) {
        entity.Kind = model.Classification.Kind;
        entity.Category = model.Classification.Category;
        entity.Type = model.Classification.Type;
        entity.Subtype = model.Classification.Subtype;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.IngestStatus = model.IngestStatus;
        entity.AiPrompt = model.AiPrompt;
        entity.Tokens = [.. model.Tokens.Select((t, i) => new AssetResourceEntity {
            AssetId = model.Id,
            TokenId = t.Id,
            Index = i,
        })];
        entity.Tags = model.Tags;
        entity.Size = model.Size;

        var statEntries = model.StatBlockEntries.SelectMany(gs => gs.Value.SelectMany(lvl => lvl.Value.Select(entry => new AssetStatEntry {
            AssetId = model.Id,
            GameSystemId = entry.Value.GameSystemId,
            Level = entry.Value.Level,
            Key = entry.Value.Key,
            Type = (AssetStatEntryType)entry.Value.Type,
            Value = entry.Value.Value,
            Description = entry.Value.Description,
            Modifiers = SerializeModifiers(entry.Value.Modifiers),
        })));

        entity.StatBlockEntries = [.. statEntries];
    }

    public static Expression<Func<AssetResourceEntity, ResourceMetadata>> AsResourceToken = entity
        => new() {
            Id = entity.TokenId,
            Path = entity.Token.Path,
            ContentType = entity.Token.ContentType,
            FileName = entity.Token.FileName,
            FileSize = entity.Token.FileSize,
            Dimensions = entity.Token.Dimensions,
            Duration = entity.Token.Duration,
        };

    private static StatModifier[]? DeserializeModifiers(string? json) {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try {
            return JsonSerializer.Deserialize<StatModifier[]>(json);
        }
        catch (JsonException) {
            return null;
        }
    }

    private static string? SerializeModifiers(StatModifier[]? modifiers) => modifiers is null || modifiers.Length == 0 ? null : JsonSerializer.Serialize(modifiers);
}