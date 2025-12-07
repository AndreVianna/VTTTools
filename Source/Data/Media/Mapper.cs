using ResourceClassification = VttTools.Media.Model.ResourceClassification;
using ResourceClassificationEntity = VttTools.Data.Media.Entities.ResourceClassification;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using ResourceFeatureEntity = VttTools.Data.Media.Entities.ResourceFeature;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;

namespace VttTools.Data.Media;

internal static class Mapper {
    internal static Expression<Func<ResourceEntity, ResourceMetadata>> AsResource = entity
        => new() {
            Id = entity.Id,
            ResourceType = entity.ResourceType,
            Classification = new ResourceClassification(
                entity.Classification.Kind,
                entity.Classification.Category,
                entity.Classification.Type,
                entity.Classification.Subtype),
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

    [return: NotNullIfNotNull(nameof(entity))]
    internal static ResourceMetadata? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            ResourceType = entity.ResourceType,
            Classification = new ResourceClassification(
                entity.Classification.Kind,
                entity.Classification.Category,
                entity.Classification.Type,
                entity.Classification.Subtype),
            Path = entity.Path,
            ContentType = entity.ContentType,
            FileName = entity.FileName,
            FileLength = entity.FileLength,
            Size = entity.Size,
            Duration = entity.Duration,
            Features = [.. entity.Features.GroupBy(f => f.Key, f => f.Value).ToDictionary(g => g.Key, g => g.ToHashSet())],
            OwnerId = entity.OwnerId,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
        };

    internal static ResourceEntity ToEntity(this ResourceMetadata model)
        => new() {
            Id = model.Id,
            ResourceType = model.ResourceType,
            Classification = new ResourceClassificationEntity {
                Kind = model.Classification.Kind,
                Category = model.Classification.Category,
                Type = model.Classification.Type,
                Subtype = model.Classification.Subtype,
            },
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

    internal static void UpdateFrom(this ResourceEntity entity, ResourceMetadata model) {
        entity.ResourceType = model.ResourceType;
        entity.Classification = new ResourceClassificationEntity {
            Kind = model.Classification.Kind,
            Category = model.Classification.Category,
            Type = model.Classification.Type,
            Subtype = model.Classification.Subtype,
        };
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