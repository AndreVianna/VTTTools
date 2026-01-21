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

    internal static Encounter Clone(this Encounter original, string? cloneName) {
        var clone = new Encounter {
            Name = cloneName,
            Description = original.Description,
            Stage = original.Stage,
        };
        clone.Actors.AddRange(original.Actors.Select(a => a.Clone()));
        clone.Objects.AddRange(original.Objects.Select(p => p.Clone()));
        clone.Effects.AddRange(original.Effects.Select(e => e.Clone()));
        return clone;
    }

    internal static EncounterActor Clone(this EncounterActor original)
        => new() {
            Asset = original.Asset,
            Name = original.Name,
            Display = original.Display,
            Position = original.Position,
            Size = original.Size,
            Frame = original.Frame,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            IsHidden = original.IsHidden,
            IsLocked = original.IsLocked,
            ControlledBy = original.ControlledBy,
        };

    internal static EncounterObject Clone(this EncounterObject original)
        => new() {
            Asset = original.Asset,
            Name = original.Name,
            Display = original.Display?.Clone(),
            ClosedDisplay = original.ClosedDisplay?.Clone(),
            OpenedDisplay = original.OpenedDisplay?.Clone(),
            DestroyedDisplay = original.DestroyedDisplay?.Clone(),
            Position = original.Position,
            Size = original.Size,
            Rotation = original.Rotation,
            Elevation = original.Elevation,
            IsHidden = original.IsHidden,
            IsLocked = original.IsLocked,
            State = original.State,
        };

    internal static EncounterEffect Clone(this EncounterEffect original)
        => new() {
            Name = original.Name,
            Position = original.Position,
            Rotation = original.Rotation,
            Asset = original.Asset,
            State = original.State,
            IsHidden = original.IsHidden,
            TriggerRegion = original.TriggerRegion,
            Display = original.Display?.Clone(),
            EnabledDisplay = original.EnabledDisplay?.Clone(),
            DisabledDisplay = original.DisabledDisplay?.Clone(),
            OnTriggerDisplay = original.OnTriggerDisplay?.Clone(),
            TriggeredDisplay = original.TriggeredDisplay?.Clone(),
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

    internal static ResourceMetadata Clone(this ResourceMetadata original)
        => new() {
            Id = original.Id,
            Path = original.Path,
            ContentType = original.ContentType,
            FileName = original.FileName,
            FileSize = original.FileSize,
            Dimensions = original.Dimensions,
            Duration = original.Duration,
        };
}