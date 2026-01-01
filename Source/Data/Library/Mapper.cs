using AdventureEntity = VttTools.Data.Library.Adventures.Entities.Adventure;
using CampaignEntity = VttTools.Data.Library.Campaigns.Entities.Campaign;
using EncounterActorEntity = VttTools.Data.Library.Encounters.Entities.EncounterActor;
using EncounterEffectEntity = VttTools.Data.Library.Encounters.Entities.EncounterEffect;
using EncounterEntity = VttTools.Data.Library.Encounters.Entities.Encounter;
using EncounterObjectEntity = VttTools.Data.Library.Encounters.Entities.EncounterObject;
using WorldEntity = VttTools.Data.Library.Worlds.Entities.World;

namespace VttTools.Data.Library;

internal static class Mapper {
    internal static Expression<Func<WorldEntity, World>> AsWorld = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background.ToModel(),
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Campaigns = entity.Campaigns.AsQueryable().Select(AsChildCampaign!).ToList(),
            Adventures = entity.Adventures.AsQueryable().Select(AsChildAdventure!).ToList(),
        };

    internal static Expression<Func<CampaignEntity, Campaign>> AsCampaign = entity
        => new() {
            OwnerId = entity.OwnerId,
            World = entity.World != null ? entity.World.ToModel(false) : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background.ToModel(),
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = entity.Adventures.AsQueryable().Select(AsChildAdventure!).ToList(),
        };

    internal static Expression<Func<CampaignEntity, Campaign>> AsChildCampaign = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background.ToModel(),
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = entity.Adventures.AsQueryable().Select(AsAdventure!).ToList(),
        };

    internal static Expression<Func<AdventureEntity, Adventure>> AsChildAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background.ToModel(),
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = entity.Encounters.AsQueryable().Select(AsChildEncounter!).ToList(),
        };

    internal static Expression<Func<AdventureEntity, Adventure>> AsAdventure = entity
        => new() {
            OwnerId = entity.OwnerId,
            World = entity.World != null ? entity.World.ToModel(false) : null,
            Campaign = entity.Campaign != null ? entity.Campaign.ToModel(false, false) : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background.ToModel(),
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = entity.Encounters.AsQueryable().Select(AsChildEncounter!).ToList(),
        };

    internal static Expression<Func<EncounterEntity, Encounter>> AsChildEncounter = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Stage = entity.Stage.ToModel(),
            Actors = entity.Actors.AsQueryable().Select(AsEncounterActor!).ToList(),
            Objects = entity.Objects.AsQueryable().Select(AsEncounterProp!).ToList(),
            Effects = entity.Effects.AsQueryable().Select(AsEncounterEffect!).ToList(),
        };

    internal static Expression<Func<EncounterEntity, Encounter>> AsEncounter = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Adventure = entity.Adventure.ToModel(false, false),
            Stage = entity.Stage.ToModel(),
            Actors = entity.Actors.AsQueryable().Select(AsEncounterActor!).ToList(),
            Objects = entity.Objects.AsQueryable().Select(AsEncounterProp!).ToList(),
            Effects = entity.Effects.AsQueryable().Select(AsEncounterEffect!).ToList(),
        };

    internal static Expression<Func<EncounterActorEntity, EncounterActor>> AsEncounterActor = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Asset = entity.Asset.ToModel(),
            Position = entity.Position,
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = entity.Size,
            Display = entity.Display == null ? null : entity.Display.ToModel(),
            Frame = entity.Frame,
            ControlledBy = entity.ControlledBy,
            IsHidden = entity.IsHidden,
            IsLocked = entity.IsLocked,
        };

    internal static Expression<Func<EncounterObjectEntity, EncounterObject>> AsEncounterProp = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Asset = entity.Asset.ToModel(),
            Position = entity.Position,
            Rotation = entity.Rotation,
            Elevation = entity.Elevation,
            Size = entity.Size,
            Display = entity.Display == null ? null : entity.Display.ToModel(),
            ClosedDisplay = entity.ClosedDisplay == null ? null : entity.ClosedDisplay.ToModel(),
            OpenedDisplay = entity.OpenedDisplay == null ? null : entity.OpenedDisplay.ToModel(),
            DestroyedDisplay = entity.DestroyedDisplay == null ? null : entity.DestroyedDisplay.ToModel(),
            State = entity.State,
            IsHidden = entity.IsHidden,
            IsLocked = entity.IsLocked,
        };

    internal static Expression<Func<EncounterEffectEntity, EncounterEffect>> AsEncounterEffect = entity
        => new() {
            Index = entity.Index,
            Name = entity.Name,
            Position = entity.Position,
            Rotation = entity.Rotation,
            Asset = entity.Asset.ToModel(),
            State = entity.State,
            IsHidden = entity.IsHidden,
            TriggerRegion = entity.TriggerShape == null ? null : new Shape {
                Id = entity.TriggerShape.Id,
                Type = entity.TriggerShape.Preset,
                Radius = entity.TriggerShape.Radius,
                Width = entity.TriggerShape.Width,
                Length = entity.TriggerShape.Length,
                Arc = entity.TriggerShape.Arc,
                Direction = entity.TriggerShape.Direction,
                Vertices = entity.TriggerShape.Vertices.OrderBy(v => v.Index).Select(v => new Point(v.X, v.Y)).ToList(),
            },
            Display = entity.Display == null ? null : entity.Display.ToModel(),
            EnabledDisplay = entity.EnabledDisplay == null ? null : entity.EnabledDisplay.ToModel(),
            DisabledDisplay = entity.DisabledDisplay == null ? null : entity.DisabledDisplay.ToModel(),
            OnTriggerDisplay = entity.OnTriggerDisplay == null ? null : entity.OnTriggerDisplay.ToModel(),
            TriggeredDisplay = entity.TriggeredDisplay == null ? null : entity.TriggeredDisplay.ToModel(),
        };

    [return: NotNullIfNotNull(nameof(entity))]
    internal static World? ToModel(this WorldEntity? entity, bool includeChildren = true)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background.ToModel(),
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Campaigns = includeChildren
                ? entity.Campaigns.Select(c => c.ToModel(includeParent: false)).ToList()
                : [],
            Adventures = includeChildren
                ? entity.Adventures.Select(a => a.ToModel(includeParent: false)).ToList()
                : [],
        };

    internal static WorldEntity ToEntity(this World model) {
        var entity = new WorldEntity {
            OwnerId = model.OwnerId,
            Id = model.Id,
            Name = model.Name,
            BackgroundId = model.Background?.Id,
            Description = model.Description,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            Campaigns = model.Campaigns.ConvertAll(c => c.ToEntity()),
            Adventures = model.Adventures.ConvertAll(c => c.ToEntity()),
        };
        return entity;
    }

    internal static void UpdateFrom(this WorldEntity entity, World model) {
        entity.OwnerId = model.OwnerId;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        entity.Campaigns = model.Campaigns.ConvertAll(a => a.ToEntity());
        entity.Adventures = model.Adventures.ConvertAll(a => a.ToEntity());
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Campaign? ToModel(this CampaignEntity? entity, bool includeParent = false, bool includeChildren = true)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            World = includeParent ? entity.World?.ToModel(includeChildren: false) : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Background = entity.Background.ToModel(),
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventures = includeChildren
                ? entity.Adventures.Select(a => a.ToModel(includeParent: false)).ToList()
                : [],
        };

    internal static CampaignEntity ToEntity(this Campaign model) {
        var entity = new CampaignEntity {
            OwnerId = model.OwnerId,
            WorldId = model.World?.Id,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            BackgroundId = model.Background?.Id,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            Adventures = model.Adventures.ConvertAll(a => a.ToEntity()),
        };
        return entity;
    }

    internal static void UpdateFrom(this CampaignEntity entity, Campaign model) {
        entity.OwnerId = model.OwnerId;
        entity.WorldId = model.World?.Id;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.BackgroundId = model.Background?.Id;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        entity.Adventures = model.Adventures.ConvertAll(a => a.ToEntity());
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Adventure? ToModel(this AdventureEntity? entity, bool includeParent = false, bool includeChildren = true)
        => entity == null ? null : new() {
            OwnerId = entity.OwnerId,
            World = includeParent ? entity.World?.ToModel(includeChildren: false) : null,
            Campaign = includeParent ? entity.Campaign?.ToModel(includeParent: false, includeChildren: false) : null,
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Style = entity.Style,
            Background = entity.Background.ToModel(),
            IsOneShot = entity.IsOneShot,
            IsPublic = entity.IsPublic,
            IsPublished = entity.IsPublished,
            Encounters = includeChildren
                ? entity.Encounters.Select(e => e.ToModel(includeParent: false)).ToList()
                : [],
        };

    internal static AdventureEntity ToEntity(this Adventure model) {
        var entity = new AdventureEntity {
            OwnerId = model.OwnerId,
            WorldId = model.World?.Id,
            CampaignId = model.Campaign?.Id,
            Id = model.Id,
            Name = model.Name,
            Description = model.Description,
            BackgroundId = model.Background?.Id,
            Style = model.Style,
            IsOneShot = model.IsOneShot,
            IsPublic = model.IsPublic,
            IsPublished = model.IsPublished,
            Encounters = model.Encounters.ConvertAll(s => s.ToEntity(model.Id)),
        };
        return entity;
    }

    internal static void UpdateFrom(this AdventureEntity entity, Adventure model) {
        entity.OwnerId = model.OwnerId;
        entity.WorldId = model.World?.Id;
        entity.CampaignId = model.Campaign?.Id;
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.BackgroundId = model.Background?.Id;
        entity.Style = model.Style;
        entity.IsPublic = model.IsPublic;
        entity.IsPublished = model.IsPublished;
        entity.IsOneShot = model.IsOneShot;
        var existingEncounters = entity.Encounters.Join(model.Encounters, se => se.Id, sm => sm.Id, UpdateFrom);
        var newEncounters = model.Encounters.Where(sm => entity.Encounters.All(se => se.Id != sm.Id)).Select(s => s.ToEntity(model.Id));
        entity.Encounters = [.. existingEncounters.Union(newEncounters)];
    }

    [return: NotNullIfNotNull(nameof(entity))]
    internal static Encounter? ToModel(this EncounterEntity? entity, bool includeParent = false, bool includeChildren = true) {
        if (entity is null)
            return null;
        var grid = new Grid {
            Type = entity.Stage.GridType,
            CellSize = entity.Stage.GridCellSize,
            Offset = entity.Stage.GridOffset,
            Scale = entity.Stage.GridScale,
        };
        return new() {
            Id = entity.Id,
            OwnerId = entity.OwnerId,
            Name = entity.Name,
            Description = entity.Description,
            IsPublished = entity.IsPublished,
            IsPublic = entity.IsPublic,
            Adventure = includeParent ? entity.Adventure.ToModel(includeChildren: false) : null!,
            Stage = entity.Stage.ToModel(),
            Actors = includeChildren ? [.. entity.Actors.Select(a => a.ToModel(grid))] : [],
            Objects = includeChildren ? [.. entity.Objects.Select(p => p.ToModel(grid))] : [],
            Effects = includeChildren ? [.. entity.Effects.Select(e => e.ToModel(grid))] : [],
        };
    }

    internal static EncounterEntity ToEntity(this Encounter model, Guid adventureId) {
        var entity = new EncounterEntity {
            Id = model.Id,
            OwnerId = model.OwnerId,
            AdventureId = adventureId,
            Name = model.Name,
            Description = model.Description,
            IsPublished = model.IsPublished,
            IsPublic = model.IsPublic,
            StageId = model.Stage.Id,
            Actors = model.Actors.ConvertAll(a => a.ToEntity(model.Id, model.Stage.Grid)),
            Objects = model.Objects.ConvertAll(p => p.ToEntity(model.Id, model.Stage.Grid)),
            Effects = model.Effects.ConvertAll(e => e.ToEntity(model.Id, model.Stage.Grid)),
        };
        return entity;
    }

    internal static EncounterEntity UpdateFrom(this EncounterEntity entity, Encounter model) {
        entity.Id = model.Id;
        entity.Name = model.Name;
        entity.OwnerId = model.OwnerId;
        entity.Description = model.Description;
        entity.IsPublished = model.IsPublished;
        entity.IsPublic = model.IsPublic;
        entity.StageId = model.Stage.Id;

        var grid = new Grid {
            Type = entity.Stage.GridType,
            CellSize = entity.Stage.GridCellSize,
            Offset = entity.Stage.GridOffset,
            Scale = entity.Stage.GridScale,
        };

        var actorIndices = model.Actors.Select(a => a.Index).ToHashSet();
        foreach (var actorToRemove in entity.Actors.Where(ea => !actorIndices.Contains(ea.Index)).ToList())
            entity.Actors.Remove(actorToRemove);
        foreach (var modelActor in model.Actors) {
            var existingActor = entity.Actors.FirstOrDefault(ea => ea.Index == modelActor.Index);
            if (existingActor is not null)
                existingActor.UpdateFrom(modelActor, grid);
            else
                entity.Actors.Add(modelActor.ToEntity(entity.Id, grid));
        }

        var propIndices = model.Objects.Select(p => p.Index).ToHashSet();
        foreach (var propToRemove in entity.Objects.Where(ep => !propIndices.Contains(ep.Index)).ToList())
            entity.Objects.Remove(propToRemove);
        foreach (var modelProp in model.Objects) {
            var existingProp = entity.Objects.FirstOrDefault(ep => ep.Index == modelProp.Index);
            if (existingProp is not null)
                existingProp.UpdateFrom(modelProp, grid);
            else
                entity.Objects.Add(modelProp.ToEntity(entity.Id, grid));
        }

        var effectIndices = model.Effects.Select(e => e.Index).ToHashSet();
        foreach (var effectToRemove in entity.Effects.Where(ee => !effectIndices.Contains(ee.Index)).ToList())
            entity.Effects.Remove(effectToRemove);
        foreach (var modelEffect in model.Effects) {
            var existingEffect = entity.Effects.FirstOrDefault(ee => ee.Index == modelEffect.Index);
            if (existingEffect is not null)
                existingEffect.UpdateFrom(modelEffect, grid);
            else
                entity.Effects.Add(modelEffect.ToEntity(entity.Id, grid));
        }

        return entity;
    }
}