namespace VttTools.Library.Services;

public static class Cloner {
    internal static Adventure Clone(this Adventure original, Guid userId, string cloneName) {
        var clone = new Adventure {
            OwnerId = userId,
            World = original.World,
            Campaign = original.Campaign,
            Name = cloneName,
            Description = original.Description,
            Style = original.Style,
            Background = original.Background?.Clone(),
        };
        clone.Encounters.AddRange(original.Encounters.Select(ep => ep.Clone(ep.Name)));
        return clone;
    }

    internal static Encounter Clone(this Encounter original, string cloneName) {
        var clone = new Encounter {
            Name = cloneName,
            Description = original.Description,
            Stage = original.Stage,
            Grid = original.Grid,
        };
        clone.Assets.AddRange(original.Assets.Select(sa => sa.Clone()));
        return clone;
    }

    internal static EncounterAsset Clone(this EncounterAsset original)
        => new() {
            AssetId = original.AssetId,
            Index = original.Index,
            Name = original.Name,
            Notes = original.Notes,
            Image = original.Image,
            Position = original.Position,
            Size = original.Size,
            Frame = original.Frame,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            IsVisible = original.IsVisible,
            IsLocked = original.IsLocked,
            ControlledBy = original.ControlledBy,
        };

    internal static World Clone(this World original, Guid userId, string cloneName) {
        var clone = new World {
            OwnerId = userId,
            Name = cloneName,
            Description = original.Description,
            Background = original.Background?.Clone(),
        };
        clone.Campaigns.AddRange(original.Campaigns.Select(c => c.Clone(userId, c.Name)));
        clone.Adventures.AddRange(original.Adventures.Select(c => c.Clone(userId, c.Name)));
        return clone;
    }

    internal static Campaign Clone(this Campaign original, Guid userId, string cloneName) {
        var clone = new Campaign {
            OwnerId = userId,
            World = original.World,
            Name = cloneName,
            Description = original.Description,
            Background = original.Background?.Clone(),
        };
        clone.Adventures.AddRange(original.Adventures.Select(a => a.Clone(userId, a.Name)));
        return clone;
    }

    internal static Resource Clone(this Resource original)
        => new() {
            Id = original.Id,
            Type = original.Type,
            Path = original.Path,
            ContentType = original.ContentType,
            FileName = original.FileName,
            FileLength = original.FileLength,
            Size = original.Size,
            Duration = original.Duration,
            Features = [.. original.Features],
        };
}