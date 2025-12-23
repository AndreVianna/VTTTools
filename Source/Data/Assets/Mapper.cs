using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using AssetResourceEntity = VttTools.Data.Assets.Entities.AssetResource;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;
using ResourceRole = VttTools.Media.Model.ResourceRole;
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
            TokenSize = entity.TokenSize,
            StatBlocks = entity.StatEntries.GroupBy(stv => stv.Level)
                .ToDictionary(g => g.Key, g => new Map<StatBlockValue>(g.ToDictionary(k => k.Key, v => new StatBlockValue(
                    v.Type == AssetStatEntryType.Text ? v.Value : null,
                    v.Type == AssetStatEntryType.Number ? decimal.Parse(v.Value!) : null,
                    v.Type == AssetStatEntryType.Flag ? bool.Parse(v.Value!) : null)))),
            StatEntries = entity.StatEntries.GroupBy(e => e.GameSystemId)
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
            Tags = entity.Tags,
            Portrait = entity.Resources.AsQueryable().Where(r => r.Role == ResourceRole.Portrait).Select(AsResourceToken!).FirstOrDefault(),
            Tokens = entity.Resources.AsQueryable().Where(r => r.Role == ResourceRole.Token).OrderBy(r => r.Index).Select(AsResourceToken!).ToList(),
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
               Tags = entity.Tags,
               TokenSize = entity.TokenSize,
               StatBlocks = entity.StatEntries.GroupBy(stv => stv.Level)
                    .ToDictionary(g => g.Key, g => new Map<StatBlockValue>(g.ToDictionary(k => k.Key, v => new StatBlockValue(
                        v.Type == AssetStatEntryType.Text ? v.Value : null,
                        v.Type == AssetStatEntryType.Number ? decimal.Parse(v.Value!) : null,
                        v.Type == AssetStatEntryType.Flag ? bool.Parse(v.Value!) : null)))),
               StatEntries = entity.StatEntries.GroupBy(e => e.GameSystemId)
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
               Portrait = entity.Resources.FirstOrDefault(r => r.Role == ResourceRole.Portrait)?.Resource.ToModel(),
               Tokens = [.. entity.Resources.Where(r => r.Role == ResourceRole.Token).OrderBy(r => r.Index).Select(r => r.Resource.ToModel())],
           };

    public static AssetEntity ToEntity(this Asset model) {
        // Use StatEntries if available, otherwise fall back to StatBlocks for backward compatibility
        var statEntries = model.StatEntries.Count > 0
            ? model.StatEntries.SelectMany(gs => gs.Value.SelectMany(lvl => lvl.Value.Select(entry => new AssetStatEntry {
                AssetId = model.Id,
                GameSystemId = entry.Value.GameSystemId,
                Level = entry.Value.Level,
                Key = entry.Value.Key,
                Type = (AssetStatEntryType)entry.Value.Type,
                Value = entry.Value.Value,
                Description = entry.Value.Description,
                Modifiers = SerializeModifiers(entry.Value.Modifiers),
            })))
            : model.StatBlocks.SelectMany(f => f.Value.Select(g => new AssetStatEntry {
                AssetId = model.Id,
                GameSystemId = Guid.Empty, // Will need to be set by caller for legacy data
                Key = g.Key,
                Level = f.Key,
                Type = g.Value.IsFlag ? AssetStatEntryType.Flag
                        : g.Value.IsNumber ? AssetStatEntryType.Number
                        : AssetStatEntryType.Text,
                Value = g.Value.Value is null ? null : $"{g.Value.Value}",
            }));

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
            Tags = model.Tags,
            TokenSize = model.TokenSize,
            StatEntries = [.. statEntries],
        };

        var resources = new List<AssetResourceEntity>();
        if (model.Portrait is not null) {
            resources.Add(new() {
                AssetId = model.Id,
                ResourceId = model.Portrait.Id,
                Role = ResourceRole.Portrait,
                Index = 0,
            });
        }

        resources.AddRange(model.Tokens.Select((t, i) => new AssetResourceEntity {
            AssetId = model.Id,
            ResourceId = t.Id,
            Role = ResourceRole.Token,
            Index = i,
        }));

        entity.Resources = resources;
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
        entity.Tags = model.Tags;
        entity.TokenSize = model.TokenSize;

        // Use StatEntries if available, otherwise fall back to StatBlocks for backward compatibility
        var statEntries = model.StatEntries.Count > 0
            ? model.StatEntries.SelectMany(gs => gs.Value.SelectMany(lvl => lvl.Value.Select(entry => new AssetStatEntry {
                AssetId = model.Id,
                GameSystemId = entry.Value.GameSystemId,
                Level = entry.Value.Level,
                Key = entry.Value.Key,
                Type = (AssetStatEntryType)entry.Value.Type,
                Value = entry.Value.Value,
                Description = entry.Value.Description,
                Modifiers = SerializeModifiers(entry.Value.Modifiers),
            })))
            : model.StatBlocks.SelectMany(f => f.Value.Select(g => new AssetStatEntry {
                AssetId = model.Id,
                GameSystemId = Guid.Empty, // Will need to be set by caller for legacy data
                Key = g.Key,
                Level = f.Key,
                Type = g.Value.IsFlag ? AssetStatEntryType.Flag
                        : g.Value.IsNumber ? AssetStatEntryType.Number
                        : AssetStatEntryType.Text,
                Value = g.Value.Value is null ? null : $"{g.Value.Value}",
            }));

        entity.StatEntries = [.. statEntries];

        // Update Resources collection
        entity.Resources.Clear();

        if (model.Portrait is not null) {
            entity.Resources.Add(new() {
                AssetId = model.Id,
                ResourceId = model.Portrait.Id,
                Role = ResourceRole.Portrait,
                Index = 0,
            });
        }

        foreach (var (token, index) in model.Tokens.Select((t, i) => (t, i))) {
            entity.Resources.Add(new() {
                AssetId = model.Id,
                ResourceId = token.Id,
                Role = ResourceRole.Token,
                Index = index,
            });
        }
    }

    public static Expression<Func<AssetResourceEntity, ResourceMetadata>> AsResourceToken = entity
        => new() {
            Id = entity.ResourceId,
            Path = entity.Resource.Path,
            ContentType = entity.Resource.ContentType,
            FileName = entity.Resource.FileName,
            FileSize = entity.Resource.FileSize,
            Dimensions = entity.Resource.Dimensions,
            Duration = entity.Resource.Duration,
        };

    private static StatModifier[]? DeserializeModifiers(string? json) {
        if (string.IsNullOrWhiteSpace(json)) {
            return null;
        }

        try {
            return JsonSerializer.Deserialize<StatModifier[]>(json);
        }
        catch (JsonException) {
            return null;
        }
    }

    private static string? SerializeModifiers(StatModifier[]? modifiers) => modifiers is null || modifiers.Length == 0 ? null : JsonSerializer.Serialize(modifiers);
}