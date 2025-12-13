namespace VttTools.Library.Services;

/// <summary>
/// Implements IAdventureService using EF Core storage.
/// </summary>
public class AdventureService(IAdventureStorage adventureStorage, IEncounterStorage encounterStorage, IMediaStorage mediaStorage, ILogger<AdventureService> logger)
    : IAdventureService {
    /// <inheritdoc />
    public async Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default) {
        try {
            return await adventureStorage.GetAllAsync(ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve Adventures");
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Adventure[]> GetAdventuresAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            return await adventureStorage.GetManyAsync(filterDefinition, ct);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to retrieve Adventures with filter: {FilterDefinition}", filterDefinition);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default)
        => adventureStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Adventure>> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var adventure = new Adventure {
            OwnerId = userId,
            World = data.WorldId.HasValue
                ? new World { Id = data.WorldId.Value }
                : null,
            Campaign = data.CampaignId.HasValue
                ? new Campaign { Id = data.CampaignId.Value }
                : null,
            Name = data.Name,
            Description = data.Description,
            Style = data.Style,
            IsOneShot = data.IsOneShot,
            Background = data.BackgroundId.HasValue
                ? new ResourceMetadata { Id = data.BackgroundId.Value }
                : null,
        };
        await adventureStorage.AddAsync(adventure, ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> CloneAdventureAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await adventureStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        // Fixed: Allow cloning if user is owner OR if asset is public+published
        if (original.OwnerId != userId && !(original is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");

        var allAdventures = await GetAdventuresAsync($"AvailableTo:{userId}", ct);
        var existingNames = allAdventures.Select(a => a.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await adventureStorage.UpdateAsync(renamedOriginal, ct);
        }

        var clone = original.Clone(userId, cloneName);
        await adventureStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Adventure>> UpdateAdventureAsync(Guid userId, Guid id, UpdatedAdventureData data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        adventure = adventure with {
            Name = data.Name.IsSet ? data.Name.Value : adventure.Name,
            Description = data.Description.IsSet ? data.Description.Value : adventure.Description,
            Style = data.Style.IsSet ? data.Style.Value : adventure.Style,
            Background = data.BackgroundId.IsSet
                ? data.BackgroundId.Value.HasValue
                    ? await mediaStorage.FindByIdAsync(data.BackgroundId.Value.Value, ct)
                    : null
                : adventure.Background,
            IsPublished = data.IsListed.IsSet ? data.IsListed.Value : adventure.IsPublished,
            IsOneShot = data.IsOneShot.IsSet ? data.IsOneShot.Value : adventure.IsOneShot,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : adventure.IsPublic,
            World = data.WorldId.IsSet
                        ? data.WorldId.Value.HasValue
                            ? new World { Id = data.WorldId.Value.Value }
                            : null
                        : adventure.World,
            Campaign = data.CampaignId.IsSet
                        ? data.CampaignId.Value.HasValue
                            ? new Campaign { Id = data.CampaignId.Value.Value }
                            : null
                        : adventure.Campaign,
        };
        await adventureStorage.UpdateAsync(adventure, ct);
        return adventure;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await adventureStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public Task<Encounter[]> GetEncountersAsync(Guid id, CancellationToken ct = default)
        => encounterStorage.GetByParentIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Encounter>> AddNewEncounterAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var encounter = new Encounter();
        await encounterStorage.AddAsync(encounter, id, ct);
        return encounter;
    }

    /// <inheritdoc />
    public async Task<Result<Encounter>> AddClonedEncounterAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var original = await encounterStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");

        var allEncounters = await GetEncountersAsync(id, ct);
        var existingNames = allEncounters.Select(s => s.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name) {
            var renamedOriginal = original with { Name = newOriginalName };
            await encounterStorage.UpdateAsync(renamedOriginal, ct);
            original = renamedOriginal;
        }

        var clone = original.Clone(cloneName);
        await encounterStorage.AddAsync(clone, id, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveEncounterAsync(Guid userId, Guid id, Guid encounterId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure is null)
            return Result.Failure("NotFound");
        if (adventure.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await encounterStorage.DeleteAsync(encounterId, ct);
        return Result.Success();
    }
}