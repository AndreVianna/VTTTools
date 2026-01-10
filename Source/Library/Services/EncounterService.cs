using VttTools.Library.Clients;

namespace VttTools.Library.Services;

public class EncounterService(
    IEncounterStorage encounterStorage,
    IAssetStorage assetStorage,
    IStageStorage stageStorage,
    IMediaServiceClient mediaServiceClient,
    ILogger<EncounterService> logger)
    : IEncounterService {
    public Task<Encounter[]> GetAllAsync(CancellationToken ct = default)
        => encounterStorage.GetAllAsync(ct);

    public Task<Encounter?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => encounterStorage.GetByIdAsync(id, ct);

    public async Task<Result<Encounter>> CreateAsync(Guid userId, CreateEncounterData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var encounter = data.StageId is null
            ? new Encounter {
                Stage = new() {
                    Name = data.Name,
                    Description = data.Description,
                },
            } : new() {
                Name = data.Name,
                Description = data.Description,
                Stage = new() {
                    Id = data.StageId.Value
                },
            };
        await encounterStorage.UpdateAsync(encounter, ct);
        return encounter;
    }

    public async Task<Result> UpdateAsync(Guid userId, Guid id, EncounterUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;

        encounter = encounter with {
            Name = data.Name.IsSet ? data.Name.Value : encounter.Name,
            Description = data.Description.IsSet ? data.Description.Value : encounter.Description,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : encounter.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : encounter.IsPublic,
        };

        await encounterStorage.UpdateAsync(encounter, ct);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(id, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var stageId = encounter.Stage.Id;

        // Check if this is the only encounter referencing the stage BEFORE deletion
        var encounterCount = await encounterStorage.CountByStageIdAsync(stageId, ct);
        var isStageOrphaned = encounterCount == 1;

        // Delete the Encounter first (FK constraint: Encounter -> Stage is RESTRICT)
        await encounterStorage.DeleteAsync(id, ct);

        if (isStageOrphaned) {
            var stage = await stageStorage.GetByIdAsync(stageId, ct);
            if (stage is not null) {
                await DeleteStageResourcesAsync(stage, ct);
                var stageDeleted = await stageStorage.DeleteAsync(stageId, ct);
                if (stageDeleted)
                    logger.LogInformation("Deleted orphaned stage {StageId} after encounter {EncounterId}", stageId, id);
            }
        }

        return Result.Success();
    }

    private async Task DeleteStageResourcesAsync(Stage stage, CancellationToken ct) {
        List<Guid> resourceIds = [];

        if (stage.Settings.MainBackground is not null)
            resourceIds.Add(stage.Settings.MainBackground.Id);
        if (stage.Settings.AlternateBackground is not null)
            resourceIds.Add(stage.Settings.AlternateBackground.Id);
        if (stage.Settings.AmbientSound is not null)
            resourceIds.Add(stage.Settings.AmbientSound.Id);

        foreach (var resourceId in resourceIds) {
            var isUsedByOthers = await stageStorage.IsResourceInUseAsync(resourceId, stage.Id, ct);
            if (isUsedByOthers)
                continue;

            var result = await mediaServiceClient.DeleteResourceAsync(resourceId, ct);
            if (!result.IsSuccessful)
                logger.LogWarning("Failed to delete resource {ResourceId} during stage cleanup: {Error}",
                    resourceId, result.Errors.FirstOrDefault()?.Message ?? "Unknown error");
        }
    }

    public async Task<EncounterActor[]> GetActorsAsync(Guid encounterId, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        return encounter?.Actors.ToArray() ?? [];
    }

    public async Task<Result<EncounterActor>> AddActorAsync(Guid userId, Guid encounterId, Guid assetId, EncounterActorAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var asset = await assetStorage.FindByIdAsync(userId, assetId, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId && asset is not { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var nextIndex = await encounterStorage.GetNextActorIndexAsync(encounterId, ct);
        var actor = new EncounterActor {
            Index = nextIndex,
            Asset = asset,
            Name = data.Name ?? asset.Name,
            Position = data.Position,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            Size = data.Size,
            Display = data.DisplayId is null ? null : new ResourceMetadata { Id = data.DisplayId.Value },
            Frame = data.Frame,
            ControlledBy = data.ControlledBy ?? userId,
            IsHidden = data.IsHidden,
            IsLocked = data.IsLocked,
        };

        await encounterStorage.AddActorAsync(encounterId, actor, ct);
        return actor;
    }

    public async Task<Result> UpdateActorAsync(Guid userId, Guid encounterId, ushort index, EncounterActorUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var actor = encounter.Actors.FirstOrDefault(a => a.Index == index);
        if (actor is null)
            return Result.Failure("NotFound");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        actor = actor with {
            Name = data.Name.IsSet ? data.Name.Value ?? actor.Name : actor.Name,
            Position = data.Position.IsSet ? data.Position.Value : actor.Position,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : actor.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : actor.Elevation,
            Size = data.Size.IsSet ? data.Size.Value : actor.Size,
            Display = data.DisplayId.IsSet ? data.DisplayId.Value is null ? null : new ResourceMetadata { Id = data.DisplayId.Value.Value } : actor.Display,
            Frame = data.Frame.IsSet ? data.Frame.Value : actor.Frame,
            ControlledBy = data.ControlledBy.IsSet ? data.ControlledBy.Value : actor.ControlledBy,
            IsHidden = data.IsHidden.IsSet ? data.IsHidden.Value : actor.IsHidden,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : actor.IsLocked,
        };

        await encounterStorage.UpdateActorAsync(encounterId, actor, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveActorAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var actor = encounter.Actors.FirstOrDefault(a => a.Index == index);
        if (actor is null)
            return Result.Failure("NotFound");

        await encounterStorage.DeleteActorAsync(encounterId, index, ct);
        return Result.Success();
    }

    public async Task<EncounterObject[]> GetObjectsAsync(Guid encounterId, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        return encounter?.Objects.ToArray() ?? [];
    }

    public async Task<Result<EncounterObject>> AddObjectAsync(Guid userId, Guid encounterId, Guid assetId, EncounterObjectAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var asset = await assetStorage.FindByIdAsync(userId, assetId, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId && asset is not { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var nextIndex = await encounterStorage.GetNextPropIndexAsync(encounterId, ct);
        var prop = new EncounterObject {
            Index = nextIndex,
            Asset = asset,
            Name = data.Name ?? asset.Name,
            Position = data.Position,
            Rotation = data.Rotation,
            Elevation = data.Elevation,
            Size = data.Size,
            Display = data.DisplayId is null ? null : new() { Id = data.DisplayId.Value },
            ClosedDisplay = data.ClosedDisplayId is null ? null : new() { Id = data.ClosedDisplayId.Value },
            OpenedDisplay = data.OpenedDisplayId is null ? null : new() { Id = data.OpenedDisplayId.Value },
            DestroyedDisplay = data.DestroyedDisplayId is null ? null : new() { Id = data.DestroyedDisplayId.Value },
            State = data.State,
            IsHidden = data.IsHidden,
            IsLocked = data.IsLocked,
        };

        await encounterStorage.AddObjectAsync(encounterId, prop, ct);
        return prop;
    }

    public async Task<Result> UpdateObjectAsync(Guid userId, Guid encounterId, ushort index, EncounterObjectUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var prop = encounter.Objects.FirstOrDefault(p => p.Index == index);
        if (prop is null)
            return Result.Failure("NotFound");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        prop = prop with {
            Name = data.Name.IsSet ? data.Name.Value ?? prop.Name : prop.Name,
            Position = data.Position.IsSet ? data.Position.Value : prop.Position,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : prop.Rotation,
            Elevation = data.Elevation.IsSet ? data.Elevation.Value : prop.Elevation,
            Size = data.Size.IsSet ? data.Size.Value : prop.Size,
            Display = data.DisplayId.IsSet ? data.DisplayId.Value is null ? null : new ResourceMetadata { Id = data.DisplayId.Value.Value } : prop.Display,
            ClosedDisplay = data.ClosedDisplayId.IsSet ? data.ClosedDisplayId.Value is null ? null : new ResourceMetadata { Id = data.ClosedDisplayId.Value.Value } : prop.ClosedDisplay,
            OpenedDisplay = data.OpenedDisplayId.IsSet ? data.OpenedDisplayId.Value is null ? null : new ResourceMetadata { Id = data.OpenedDisplayId.Value.Value } : prop.OpenedDisplay,
            DestroyedDisplay = data.DestroyedDisplayId.IsSet ? data.DestroyedDisplayId.Value is null ? null : new ResourceMetadata { Id = data.DestroyedDisplayId.Value.Value } : prop.DestroyedDisplay,
            State = data.State.IsSet ? data.State.Value : prop.State,
            IsHidden = data.IsHidden.IsSet ? data.IsHidden.Value : prop.IsHidden,
            IsLocked = data.IsLocked.IsSet ? data.IsLocked.Value : prop.IsLocked,
        };

        await encounterStorage.UpdateObjectAsync(encounterId, prop, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveObjectAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var prop = encounter.Objects.FirstOrDefault(p => p.Index == index);
        if (prop is null)
            return Result.Failure("NotFound");

        await encounterStorage.DeletePropAsync(encounterId, index, ct);
        return Result.Success();
    }

    public async Task<EncounterEffect[]> GetEffectsAsync(Guid encounterId, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        return encounter?.Effects.ToArray() ?? [];
    }

    public async Task<Result<EncounterEffect>> AddEffectAsync(Guid userId, Guid encounterId, Guid assetId, EncounterEffectAddData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var asset = await assetStorage.FindByIdAsync(userId, assetId, ct);
        if (asset is null)
            return Result.Failure("NotFound");
        if (asset.OwnerId != userId && asset is not { IsPublic: true, IsPublished: true })
            return Result.Failure("NotAllowed");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        var nextIndex = await encounterStorage.GetNextEffectIndexAsync(encounterId, ct);
        var effect = new EncounterEffect {
            Index = nextIndex,
            Name = data.Name ?? "Effect",
            Position = data.Position,
            Rotation = data.Rotation,
            Asset = asset,
            State = data.State,
            IsHidden = data.IsHidden,
            TriggerRegion = data.TriggerRegion,
            Display = data.DisplayId is null ? null : new() { Id = data.DisplayId.Value },
            EnabledDisplay = data.EnabledDisplayId is null ? null : new() { Id = data.EnabledDisplayId.Value },
            DisabledDisplay = data.DisabledDisplayId is null ? null : new() { Id = data.DisabledDisplayId.Value },
            OnTriggerDisplay = data.OnTriggerDisplayId is null ? null : new() { Id = data.OnTriggerDisplayId.Value },
            TriggeredDisplay = data.TriggeredDisplayId is null ? null : new() { Id = data.TriggeredDisplayId.Value },
        };

        await encounterStorage.AddEffectAsync(encounterId, effect, ct);
        return effect;
    }

    public async Task<Result> UpdateEffectAsync(Guid userId, Guid encounterId, ushort index, EncounterEffectUpdateData data, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var effect = encounter.Effects.FirstOrDefault(e => e.Index == index);
        if (effect is null)
            return Result.Failure("NotFound");

        var result = data.Validate();
        if (result.HasErrors)
            return result;

        effect = effect with {
            Name = data.Name.IsSet ? data.Name.Value ?? effect.Name : effect.Name,
            Position = data.Position.IsSet ? data.Position.Value : effect.Position,
            Rotation = data.Rotation.IsSet ? data.Rotation.Value : effect.Rotation,
            State = data.State.IsSet ? data.State.Value : effect.State,
            IsHidden = data.IsHidden.IsSet ? data.IsHidden.Value : effect.IsHidden,
            TriggerRegion = data.TriggerRegion.IsSet ? data.TriggerRegion.Value : effect.TriggerRegion,
            Display = data.DisplayId.IsSet ? data.DisplayId.Value is null ? null : new ResourceMetadata { Id = data.DisplayId.Value.Value } : effect.Display,
            EnabledDisplay = data.EnabledDisplayId.IsSet ? data.EnabledDisplayId.Value is null ? null : new ResourceMetadata { Id = data.EnabledDisplayId.Value.Value } : effect.EnabledDisplay,
            DisabledDisplay = data.DisabledDisplayId.IsSet ? data.DisabledDisplayId.Value is null ? null : new ResourceMetadata { Id = data.DisabledDisplayId.Value.Value } : effect.DisabledDisplay,
            OnTriggerDisplay = data.OnTriggerDisplayId.IsSet ? data.OnTriggerDisplayId.Value is null ? null : new ResourceMetadata { Id = data.OnTriggerDisplayId.Value.Value } : effect.OnTriggerDisplay,
            TriggeredDisplay = data.TriggeredDisplayId.IsSet ? data.TriggeredDisplayId.Value is null ? null : new ResourceMetadata { Id = data.TriggeredDisplayId.Value.Value } : effect.TriggeredDisplay,
        };

        await encounterStorage.UpdateEffectAsync(encounterId, effect, ct);
        return Result.Success();
    }

    public async Task<Result> RemoveEffectAsync(Guid userId, Guid encounterId, ushort index, CancellationToken ct = default) {
        var encounter = await encounterStorage.GetByIdAsync(encounterId, ct);
        if (encounter is null)
            return Result.Failure("NotFound");
        if (encounter.Adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var effect = encounter.Effects.FirstOrDefault(e => e.Index == index);
        if (effect is null)
            return Result.Failure("NotFound");

        await encounterStorage.DeleteEffectAsync(encounterId, index, ct);
        return Result.Success();
    }
}
