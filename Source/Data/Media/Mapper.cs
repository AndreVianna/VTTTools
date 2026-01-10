using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;

namespace VttTools.Data.Media;

internal static class Mapper {
    internal static Expression<Func<ResourceEntity, ResourceMetadata>> AsResource = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            ContentType = entity.ContentType,
            Path = entity.Path,
            FileName = entity.FileName,
            FileSize = entity.FileSize,
            Dimensions = entity.Dimensions,
            Duration = entity.Duration,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static ResourceMetadata? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            ContentType = entity.ContentType,
            Path = entity.Path,
            FileName = entity.FileName,
            FileSize = entity.FileSize,
            Dimensions = entity.Dimensions,
            Duration = entity.Duration,
        };

    internal static ResourceEntity ToEntity(this ResourceMetadata model)
        => new() {
            Id = model.Id,
            OwnerId = model.OwnerId,
            ContentType = model.ContentType,
            Path = model.Path,
            FileName = model.FileName,
            FileSize = model.FileSize,
            Dimensions = model.Dimensions,
            Duration = model.Duration,
        };

    internal static void UpdateFrom(this ResourceEntity entity, ResourceMetadata model) {
        entity.OwnerId = model.OwnerId;
        entity.ContentType = model.ContentType;
        entity.Path = model.Path;
        entity.FileName = model.FileName;
        entity.FileSize = model.FileSize;
        entity.Dimensions = model.Dimensions;
        entity.Duration = model.Duration;
    }
}