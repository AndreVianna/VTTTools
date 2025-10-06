namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure Clone(this Adventure original, Guid userId) {
        var clone = new Adventure {
            OwnerId = userId,
            CampaignId = original.CampaignId,
            Name = original.Name,
            Description = original.Description,
            Type = original.Type,
            Background = original.Background.Clone(),
        };
        clone.Scenes.AddRange(original.Scenes.Select(ep => ep.Clone()));
        return clone;
    }

    internal static Scene Clone(this Scene original) {
        var clone = new Scene {
            Name = original.Name,
            Description = original.Description,
            Stage = original.Stage,
            Grid = original.Grid,
        };
        clone.Assets.AddRange(original.Assets.Select(sa => sa.Clone()));
        return clone;
    }

    internal static SceneAsset Clone(this SceneAsset original)
        => new() {
            OwnerId = original.OwnerId,
            Id = original.Id,
            Index = original.Index,
            Type = original.Type,
            Name = original.Name,
            Description = original.Description,
            Resource = original.Resource?.Clone(),
            Position = original.Position,
            Size = original.Size,
            Frame = original.Frame,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            IsLocked = original.IsLocked,
            IsPublic = original.IsPublic,
            IsPublished = original.IsPublished,
            ControlledBy = original.ControlledBy,
        };

    internal static Resource Clone(this Resource original)
        => new() {
            Id = original.Id,
            Type = original.Type,
            Path = original.Path,
            Metadata = new() {
                ContentType = original.Metadata.ContentType,
                FileName = original.Metadata.FileName,
                FileLength = original.Metadata.FileLength,
                ImageSize = original.Metadata.ImageSize,
                Duration = original.Metadata.Duration,
            },
            Tags = [.. original.Tags],
        };
}