using Asset = VttTools.Assets.Model.Asset;
using AssetEntity = VttTools.Data.Assets.Entities.Asset;
using Resource = VttTools.Media.Model.Resource;
using ResourceEntity = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Assets;

internal static class Mapper {
    internal static Expression<Func<AssetEntity, Asset>> AsAsset = static entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            Category = entity.Category,
            Resource = entity.Resource != null ? new Resource {
                Id = entity.Resource.Id,
                Type = entity.Resource.Type,
                Path = entity.Resource.Path,
                Metadata = new() {
                    ContentType = entity.Resource.ContentType,
                    FileName = entity.Resource.FileName,
                    FileLength = entity.Resource.FileLength,
                    ImageSize = entity.Resource.ImageSize,
                    Duration = entity.Resource.Duration,
                },
                Tags = entity.Resource.Tags,
            } : null,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
        };

    internal static Expression<Func<ResourceEntity, Resource>> AsResource = static entity
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

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Asset? ToModel(this AssetEntity? entity)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Type = entity.Type,
            Category = entity.Category,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
        };

    internal static AssetEntity ToEntity(this Asset model)
        => new() {
            OwnerId = model.OwnerId,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            Type = model.Type,
            Category = model.Category,
            ResourceId = model.Resource?.Id,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
        };

    internal static void UpdateFrom(this AssetEntity entity, Asset model) {
        entity.OwnerId = model.OwnerId;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.Type = model.Type;
        entity.Category = model.Category;
        entity.ResourceId = model.Resource?.Id;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Resource? ToModel(this ResourceEntity? entity)
        => entity is null ? null : new() {
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
            ContentType = model.Metadata.ContentType,
            FileName = model.Metadata.FileName,
            FileLength = model.Metadata.FileLength,
            Type = model.Type,
            Path = model.Path,
            ImageSize = model.Metadata.ImageSize,
            Duration = model.Metadata.Duration,
            Tags = model.Tags,
        };

    internal static ResourceEntity UpdateFrom(this ResourceEntity entity, Resource model) {
        entity.Id = model.Id;
        entity.Type = model.Type;
        entity.Path = model.Path;
        entity.ContentType = model.Metadata.ContentType;
        entity.FileName = model.Metadata.FileName;
        entity.FileLength = model.Metadata.FileLength;
        entity.ImageSize = model.Metadata.ImageSize;
        entity.Duration = model.Metadata.Duration;
        entity.Tags = model.Tags;
        return entity;
    }
}
