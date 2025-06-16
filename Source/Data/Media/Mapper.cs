using Resource = VttTools.Media.Model.Resource;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Media;

internal static class Mapper {
    internal static Expression<Func<ResourceEntity, Resource>> AsResource = entity
        => new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            Metadata = new() {
                ContentType = entity.ContentType,
                FileName = entity.FileName,
                FileLength = entity.FileLength,
                ImageSize = entity.ImageSize,
                Duration = entity.Duration,
            },
            Tags = entity.Tags,
        };

    internal static Resource? ToModel(this ResourceEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Type = entity.Type,
            Path = entity.Path,
            Metadata = new() {
                ContentType = entity.ContentType,
                FileName = entity.FileName,
                FileLength = entity.FileLength,
                ImageSize = entity.ImageSize,
                Duration = entity.Duration,
            },
            Tags = entity.Tags,
        };

    internal static ResourceEntity ToEntity(this Resource model)
        => new() {
            Id = model.Id,
            Type = model.Type,
            Path = model.Path,
            ContentType = model.Metadata.ContentType,
            FileName = model.Metadata.FileName,
            FileLength = model.Metadata.FileLength,
            ImageSize = model.Metadata.ImageSize,
            Duration = model.Metadata.Duration,
            Tags = model.Tags,
        };

    internal static void UpdateFrom(this ResourceEntity entity, Resource model) {
        entity.Id = model.Id;
        entity.Type = model.Type;
        entity.Path = model.Path;
        entity.ContentType = model.Metadata.ContentType;
        entity.FileName = model.Metadata.FileName;
        entity.FileLength = model.Metadata.FileLength;
        entity.ImageSize = model.Metadata.ImageSize;
        entity.Duration = model.Metadata.Duration;
        entity.Tags = model.Tags;
    }
}