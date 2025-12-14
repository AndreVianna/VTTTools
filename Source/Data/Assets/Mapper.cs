using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using AssetTokenEntity = VttTools.Data.Assets.Entities.AssetToken;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;

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
            StatBlocks = entity.StatBlock.GroupBy(stv => stv.Level)
                .ToDictionary(g => g.Key, g => new Map<StatBlockValue>(g.ToDictionary(k => k.Key, v => new StatBlockValue(
                    v.Type == AssetStatBlockValueType.Text ? v.Value : null,
                    v.Type == AssetStatBlockValueType.Number ? decimal.Parse(v.Value!) : null,
                    v.Type == AssetStatBlockValueType.Flag ? bool.Parse(v.Value!) : null)))),
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            IsDeleted = entity.IsDeleted,
            Tags = entity.Tags,
            Portrait = entity.Portrait != null ? entity.Portrait.ToModel() : null,
            Tokens = entity.AssetTokens.AsQueryable().OrderBy(a => a.Index).Select(AsToken!).ToList(),
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
               StatBlocks = entity.StatBlock.GroupBy(stv => stv.Level)
                    .ToDictionary(g => g.Key, g => new Map<StatBlockValue>(g.ToDictionary(k => k.Key, v => new StatBlockValue(
                        v.Type == AssetStatBlockValueType.Text ? v.Value : null,
                        v.Type == AssetStatBlockValueType.Number ? decimal.Parse(v.Value!) : null,
                        v.Type == AssetStatBlockValueType.Flag ? bool.Parse(v.Value!) : null)))),
               Portrait = entity.Portrait?.ToModel(),
               Tokens = [.. entity.AssetTokens.Select(v => v.Token.ToModel())],
           };

    public static AssetEntity ToEntity(this Asset model)
        => new() {
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
            StatBlock = [..model.StatBlocks.SelectMany(f => f.Value.Select(g => new AssetStatBlockValue{
                AssetId = model.Id,
                Key = g.Key,
                Level = f.Key,
                Type = g.Value.IsFlag ? AssetStatBlockValueType.Flag
                        : g.Value.IsNumber ? AssetStatBlockValueType.Number
                        : AssetStatBlockValueType.Text,
                Value = g.Value.Value is null ? null : $"{g.Value.Value}",
            }))],
            PortraitId = model.Portrait?.Id,
            AssetTokens = [.. model.Tokens.Select((t, i) => t.ToEntity(model.Id, i))],
        };

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
        entity.StatBlock = [..model.StatBlocks.SelectMany(f => f.Value.Select(g => new AssetStatBlockValue{
            AssetId = model.Id,
            Key = g.Key,
            Level = f.Key,
            Type = g.Value.IsFlag ? AssetStatBlockValueType.Flag
                    : g.Value.IsNumber ? AssetStatBlockValueType.Number
                    : AssetStatBlockValueType.Text,
            Value = g.Value.Value is null ? null : $"{g.Value.Value}",
        }))];
        entity.PortraitId = model.Portrait?.Id;
    }

    public static Expression<Func<AssetTokenEntity, ResourceMetadata>> AsToken = entity
        => new ResourceMetadata {
            Id = entity.TokenId,
            OwnerId = entity.Token.OwnerId,
            Description = entity.Token.Description,
            IsPublished = entity.Token.IsPublished,
            IsPublic = entity.Token.IsPublic,
            Path = entity.Token.Path,
            ResourceType = entity.Token.ResourceType,
            Features = new(entity.Token.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())),
            ContentType = entity.Token.ContentType,
            FileName = entity.Token.FileName,
            FileLength = entity.Token.FileLength,
            Size = entity.Token.Size,
            Duration = entity.Token.Duration,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    public static ResourceMetadata? ToModel(this AssetTokenEntity? entity)
        => entity is null
           ? null
           : new ResourceMetadata {
               Id = entity.TokenId,
               OwnerId = entity.Token.OwnerId,
               Description = entity.Token.Description,
               IsPublished = entity.Token.IsPublished,
               IsPublic = entity.Token.IsPublic,
               Path = entity.Token.Path,
               ResourceType = entity.Token.ResourceType,
               Features = [.. entity.Token.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())],
               ContentType = entity.Token.ContentType,
               FileName = entity.Token.FileName,
               FileLength = entity.Token.FileLength,
               Size = entity.Token.Size,
               Duration = entity.Token.Duration,
           };

    public static AssetTokenEntity ToEntity(this ResourceMetadata model, Guid assetId, int index)
        => new() {
            TokenId = model.Id,
            AssetId = assetId,
            Index = index,
        };

    public static void UpdateFrom(this AssetTokenEntity entity, Guid resourceId, Guid assetId, int index) {
        entity.TokenId = resourceId;
        entity.AssetId = assetId;
        entity.Index = index;
    }
}