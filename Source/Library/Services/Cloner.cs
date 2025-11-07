namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure Clone(this Adventure original, Guid userId, string cloneName) {
        var clone = new Adventure {
            OwnerId = userId,
            CampaignId = original.CampaignId,
            Name = cloneName,
            Description = original.Description,
            Style = original.Style,
            Background = original.Background?.Clone(),
        };
        clone.Scenes.AddRange(original.Scenes.Select(ep => ep.Clone(ep.Name)));
        return clone;
    }

    internal static Scene Clone(this Scene original, string cloneName) {
        var clone = new Scene {
            Name = cloneName,
            Description = original.Description,
            Stage = original.Stage,
            Grid = original.Grid,
        };
        clone.Assets.AddRange(original.Assets.Select(sa => sa.Clone()));
        return clone;
    }

    internal static SceneAsset Clone(this SceneAsset original)
        => new() {
            AssetId = original.AssetId,
            Index = original.Index,
            Number = original.Number,
            Name = original.Name,
            Notes = original.Notes,
            Token = original.Token,
            Portrait = original.Portrait,
            Position = original.Position,
            Size = original.Size,
            Frame = original.Frame,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            IsVisible = original.IsVisible,
            IsLocked = original.IsLocked,
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