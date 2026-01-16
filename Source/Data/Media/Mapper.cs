using ResourceEntity = VttTools.Data.Media.Entities.Resource;
using ResourceMetadata = VttTools.Media.Model.ResourceMetadata;

namespace VttTools.Data.Media;

internal static class Mapper {
    internal static Expression<Func<ResourceEntity, ResourceMetadata>> AsResource = entity
        => new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Role = entity.Role,
            ContentType = entity.ContentType,
            Path = entity.Path,
            FileName = entity.FileName,
            FileSize = entity.FileSize,
            Dimensions = entity.Dimensions,
            Duration = entity.Duration,
            Name = entity.Name,
            Description = entity.Description,
            Tags = entity.Tags,
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static ResourceMetadata? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Role = entity.Role,
            ContentType = entity.ContentType,
            Path = entity.Path,
            FileName = entity.FileName,
            FileSize = entity.FileSize,
            Dimensions = entity.Dimensions,
            Duration = entity.Duration,
            Name = entity.Name,
            Description = entity.Description,
            Tags = entity.Tags,
        };

    internal static ResourceEntity ToEntity(this ResourceMetadata model)
        => new() {
            Id = model.Id,
            OwnerId = model.OwnerId,
            Role = model.Role,
            ContentType = model.ContentType,
            Path = model.Path,
            FileName = model.FileName,
            FileSize = model.FileSize,
            Dimensions = model.Dimensions,
            Duration = model.Duration,
            Name = model.Name,
            Description = model.Description,
            Tags = model.Tags,
        };

    internal static void UpdateFrom(this ResourceEntity entity, ResourceMetadata model) {
        entity.OwnerId = model.OwnerId;
        entity.Role = model.Role;
        entity.ContentType = model.ContentType;
        entity.Path = model.Path;
        entity.FileName = model.FileName;
        entity.FileSize = model.FileSize;
        entity.Dimensions = model.Dimensions;
        entity.Duration = model.Duration;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Tags = model.Tags;
    }
}