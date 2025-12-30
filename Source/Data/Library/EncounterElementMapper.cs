using EncounterActorEntity = VttTools.Data.Library.Encounters.Entities.EncounterActor;
using EncounterEffectEntity = VttTools.Data.Library.Encounters.Entities.EncounterEffect;
using EncounterObjectEntity = VttTools.Data.Library.Encounters.Entities.EncounterObject;
using ShapeEntity = VttTools.Data.Common.Entities.Shape;
using ShapeVertexEntity = VttTools.Data.Common.Entities.ShapeVertex;

namespace VttTools.Data.Library;

internal static class EncounterElementMapper {
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterActor? ToModel(this EncounterActorEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Asset = new() { Id = entity.AssetId },
            Position = GridConverter.PositionToPixel(entity.Position, grid),
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = entity.Size,
            Display = entity.Display?.ToModel(),
            Frame = entity.Frame,
            ControlledBy = entity.ControlledBy,
            IsHidden = entity.IsHidden,
            IsLocked = entity.IsLocked,
        };

    internal static EncounterActorEntity ToEntity(this EncounterActor model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            AssetId = model.Asset.Id,
            Name = model.Name,
            Position = GridConverter.PositionToGrid(model.Position, grid),
            Rotation = model.Rotation,
            Elevation = model.Elevation,
            Size = model.Size,
            DisplayId = model.Display?.Id,
            Frame = model.Frame,
            ControlledBy = model.ControlledBy,
            IsHidden = model.IsHidden,
            IsLocked = model.IsLocked,
        };

    internal static EncounterActorEntity UpdateFrom(this EncounterActorEntity entity, EncounterActor model, Grid grid) {
        entity.AssetId = model.Asset.Id;
        entity.Name = model.Name;
        entity.Position = GridConverter.PositionToGrid(model.Position, grid);
        entity.Rotation = model.Rotation;
        entity.Elevation = model.Elevation;
        entity.Size = model.Size;
        entity.DisplayId = model.Display?.Id;
        entity.Frame = model.Frame;
        entity.ControlledBy = model.ControlledBy;
        entity.IsHidden = model.IsHidden;
        entity.IsLocked = model.IsLocked;
        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterObject? ToModel(this EncounterObjectEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Asset = new() { Id = entity.AssetId },
            Position = GridConverter.PositionToPixel(entity.Position, grid),
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = entity.Size,
            Display = entity.Display?.ToModel(),
            ClosedDisplay = entity.ClosedDisplay?.ToModel(),
            OpenedDisplay = entity.OpenedDisplay?.ToModel(),
            DestroyedDisplay = entity.DestroyedDisplay?.ToModel(),
            State = entity.State,
            IsHidden = entity.IsHidden,
            IsLocked = entity.IsLocked,
        };

    internal static EncounterObjectEntity ToEntity(this EncounterObject model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            AssetId = model.Asset.Id,
            Name = model.Name,
            Position = GridConverter.PositionToGrid(model.Position, grid),
            Rotation = model.Rotation,
            Elevation = model.Elevation,
            Size = model.Size,
            DisplayId = model.Display?.Id,
            ClosedDisplayId = model.ClosedDisplay?.Id,
            OpenedDisplayId = model.OpenedDisplay?.Id,
            DestroyedDisplayId = model.DestroyedDisplay?.Id,
            State = model.State,
            IsHidden = model.IsHidden,
            IsLocked = model.IsLocked,
        };

    internal static EncounterObjectEntity UpdateFrom(this EncounterObjectEntity entity, EncounterObject model, Grid grid) {
        entity.AssetId = model.Asset.Id;
        entity.Name = model.Name;
        entity.Position = GridConverter.PositionToGrid(model.Position, grid);
        entity.Rotation = model.Rotation;
        entity.Elevation = model.Elevation;
        entity.Size = model.Size;
        entity.DisplayId = model.Display?.Id;
        entity.ClosedDisplayId = model.ClosedDisplay?.Id;
        entity.OpenedDisplayId = model.OpenedDisplay?.Id;
        entity.DestroyedDisplayId = model.DestroyedDisplay?.Id;
        entity.State = model.State;
        entity.IsHidden = model.IsHidden;
        entity.IsLocked = model.IsLocked;
        return entity;
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static EncounterEffect? ToModel(this EncounterEffectEntity? entity, Grid grid)
        => entity is null ? null : new() {
            Index = entity.Index,
            Name = entity.Name,
            Position = GridConverter.PositionToPixel(entity.Position, grid),
            Rotation = entity.Rotation,
            Asset = new() { Id = entity.AssetId },
            State = entity.State,
            IsHidden = entity.IsHidden,
            TriggerRegion = entity.TriggerShape.ToModel(),
            Display = entity.Display?.ToModel(),
            EnabledDisplay = entity.EnabledDisplay?.ToModel(),
            DisabledDisplay = entity.DisabledDisplay?.ToModel(),
            OnTriggerDisplay = entity.OnTriggerDisplay?.ToModel(),
            TriggeredDisplay = entity.TriggeredDisplay?.ToModel(),
        };

    internal static EncounterEffectEntity ToEntity(this EncounterEffect model, Guid encounterId, Grid grid)
        => new() {
            EncounterId = encounterId,
            Index = model.Index,
            Name = model.Name,
            Position = GridConverter.PositionToGrid(model.Position, grid),
            Rotation = model.Rotation,
            AssetId = model.Asset.Id,
            State = model.State,
            IsHidden = model.IsHidden,
            TriggerShapeId = model.TriggerRegion?.Id,
            TriggerShape = model.TriggerRegion?.ToEntity(),
            DisplayId = model.Display?.Id,
            EnabledDisplayId = model.EnabledDisplay?.Id,
            DisabledDisplayId = model.DisabledDisplay?.Id,
            OnTriggerDisplayId = model.OnTriggerDisplay?.Id,
            TriggeredDisplayId = model.TriggeredDisplay?.Id,
        };

    internal static EncounterEffectEntity UpdateFrom(this EncounterEffectEntity entity, EncounterEffect model, Grid grid) {
        entity.Name = model.Name;
        entity.Position = GridConverter.PositionToGrid(model.Position, grid);
        entity.Rotation = model.Rotation;
        entity.AssetId = model.Asset.Id;
        entity.State = model.State;
        entity.IsHidden = model.IsHidden;
        entity.TriggerShapeId = model.TriggerRegion?.Id;
        entity.TriggerShape = model.TriggerRegion?.ToEntity();
        entity.DisplayId = model.Display?.Id;
        entity.EnabledDisplayId = model.EnabledDisplay?.Id;
        entity.DisabledDisplayId = model.DisabledDisplay?.Id;
        entity.OnTriggerDisplayId = model.OnTriggerDisplay?.Id;
        entity.TriggeredDisplayId = model.TriggeredDisplay?.Id;
        return entity;
    }

    // NOTE: Decoration and Sound mappers moved to Stage

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Shape? ToModel(this ShapeEntity? entity)
        => entity is null ? null : new() {
            Id = entity.Id,
            Tags = JsonSerializer.Deserialize<string[]>(entity.Tags, _jsonOptions) ?? [],
            Type = entity.Preset,
            Radius = entity.Radius,
            Width = entity.Width,
            Length = entity.Length,
            Arc = entity.Arc,
            Direction = entity.Direction,
            Vertices = entity.Vertices
                .OrderBy(v => v.Index)
                .Select(v => new Point(v.X, v.Y))
                .ToList(),
        };

    internal static ShapeEntity ToEntity(this Shape model)
        => new() {
            Id = model.Id == Guid.Empty ? Guid.NewGuid() : model.Id,
            Tags = JsonSerializer.Serialize(model.Tags, _jsonOptions),
            Preset = model.Type,
            Radius = model.Radius,
            Width = model.Width,
            Length = model.Length,
            Arc = model.Arc,
            Direction = model.Direction,
            Vertices = [.. model.Vertices
                .Select((vertex, index) => new ShapeVertexEntity {
                    ShapeId = model.Id == Guid.Empty ? Guid.Empty : model.Id,
                    Index = (ushort)index,
                    X = vertex.X,
                    Y = vertex.Y,
                                                                 })],
        };
}
