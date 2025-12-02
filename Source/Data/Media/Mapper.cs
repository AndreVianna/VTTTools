using Resource = VttTools.Media.Model.Resource;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using ResourceFeatureEntity = VttTools.Data.Media.Entities.ResourceFeature;

namespace VttTools.Data.Media;

internal static class Mapper {
    internal static Expression<Func<ResourceEntity, Resource>> AsResource = entity
        => new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            ContentType = entity.ContentType,
            FileName = entity.FileName,
            FileLength = entity.FileLength,
            Size = entity.Size,
            Duration = entity.Duration,
            Features = new(entity.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())),
            OwnerId = entity.OwnerId,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
        };

    internal static Resource? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            ContentType = entity.ContentType,
            FileName = entity.FileName,
            FileLength = entity.FileLength,
            Size = entity.Size,
            Duration = entity.Duration,
            Features = [..entity.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())],
            OwnerId = entity.OwnerId,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
        };

    internal static ResourceEntity ToEntity(this Resource model)
        => new() {
            Id = model.Id,
            Type = model.Type,
            Path = model.Path,
            ContentType = model.ContentType,
            FileName = model.FileName,
            FileLength = model.FileLength,
            Size = model.Size,
            Duration = model.Duration,
            Features = [..model.Features.SelectMany(f => f.Value.Select((v, i) => new ResourceFeatureEntity{
                ResourceId = model.Id,
                Key = f.Key,
                Index = i,
                Value = v,
            }))],
            OwnerId = model.OwnerId,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
        };

    internal static void UpdateFrom(this ResourceEntity entity, Resource model) {
        entity.Id = model.Id;
        entity.Type = model.Type;
        entity.Path = model.Path;
        entity.ContentType = model.ContentType;
        entity.FileName = model.FileName;
        entity.FileLength = model.FileLength;
        entity.Size = model.Size;
        entity.Duration = model.Duration;
        entity.Features = [..model.Features.SelectMany(f => f.Value.Select((v, i) => new ResourceFeatureEntity{
            ResourceId = model.Id,
            Key = f.Key,
            Index = i,
            Value = v,
        }))];
    }
}