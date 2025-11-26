using Asset = VttTools.Assets.Model.Asset;
using Resource = VttTools.Media.Model.Resource;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using AssetTokenEntity = VttTools.Data.Assets.Entities.AssetToken;

namespace VttTools.Data.Assets;

internal static class Mapper {
    public static Expression<Func<AssetEntity, Asset>> AsAsset = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Classification = entity.Classification,
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
               Classification = entity.Classification,
               Name = entity.Name,
               Description = entity.Description,
               IsPublic = entity.IsPublic,
               IsPublished = entity.IsPublished,
               TokenSize = entity.TokenSize,
               StatBlocks = entity.StatBlock.GroupBy(stv => stv.Level)
                    .ToDictionary(g => g.Key, g => new Map<StatBlockValue>(g.ToDictionary(k => k.Key, v => new StatBlockValue(
                        v.Type == AssetStatBlockValueType.Text ? v.Value : null,
                        v.Type == AssetStatBlockValueType.Number ? decimal.Parse(v.Value!) : null,
                        v.Type == AssetStatBlockValueType.Flag ? bool.Parse(v.Value!) : null)))),
               Portrait = entity.Portrait?.ToModel(),
               Tokens = [..entity.AssetTokens.Select(v => v.Token.ToModel()!)],
           };

    public static AssetEntity ToEntity(this Asset model)
        => new() {
            Id = model.Id,
            OwnerId = model.OwnerId,
            Classification = model.Classification,
            Name = model.Name,
            Description = model.Description,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
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
            AssetTokens = [..model.Tokens.Select((t, i) => t.ToEntity(model.Id, i))],
        };

    public static void UpdateFrom(this AssetEntity entity, Asset model) {
        entity.Classification = model.Classification;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
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

    public static Expression<Func<AssetTokenEntity, Resource>> AsToken = entity
        => new Resource {
            Id = entity.TokenId,
            OwnerId = entity.Token.OwnerId,
            Description = entity.Token.Description,
            IsPublished = entity.Token.IsPublished,
            IsPublic = entity.Token.IsPublic,
            Path = entity.Token.Path,
            Type = entity.Token.Type,
            Features = new(entity.Token.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())),
            ContentType = entity.Token.ContentType,
            FileName = entity.Token.FileName,
            FileLength = entity.Token.FileLength,
            Size = entity.Token.Size,
            Duration = entity.Token.Duration,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    public static Resource? ToModel(this AssetTokenEntity? entity)
        => entity is null
           ? null
           : new Resource {
               Id = entity.TokenId,
               OwnerId = entity.Token.OwnerId,
               Description = entity.Token.Description,
               IsPublished = entity.Token.IsPublished,
               IsPublic = entity.Token.IsPublic,
               Path = entity.Token.Path,
               Type = entity.Token.Type,
               Features = [..entity.Token.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())],
               ContentType = entity.Token.ContentType,
               FileName = entity.Token.FileName,
               FileLength = entity.Token.FileLength,
               Size = entity.Token.Size,
               Duration = entity.Token.Duration,
           };

    public static AssetTokenEntity ToEntity(this Resource model, Guid assetId, int index)
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