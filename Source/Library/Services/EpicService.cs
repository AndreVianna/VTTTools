namespace VttTools.Library.Services;

/// <summary>
/// Service for managing Epic templates and their nested Campaigns.
/// </summary>
public class EpicService(IEpicStorage epicStorage, ICampaignStorage campaignStorage, IMediaStorage mediaStorage)
    : IEpicService {
    /// <inheritdoc />
    public async Task<Epic[]> GetEpicsAsync(CancellationToken ct = default) {
        try {
            return await epicStorage.GetAllAsync(ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public async Task<Epic[]> GetEpicsAsync(string filterDefinition, CancellationToken ct = default) {
        try {
            return await epicStorage.GetManyAsync(filterDefinition, ct);
        }
        catch (Exception ex) {
            Console.WriteLine(ex);
            return [];
        }
    }

    /// <inheritdoc />
    public Task<Epic?> GetEpicByIdAsync(Guid id, CancellationToken ct = default)
        => epicStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Result<Epic>> CreateEpicAsync(Guid userId, CreateEpicData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        var epic = new Epic {
            OwnerId = userId,
            Name = data.Name,
            Description = data.Description,
            Background = data.BackgroundId.HasValue
                ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value, ct)
                : null,
            IsPublished = data.IsPublished,
            IsPublic = data.IsPublic,
        };
        await epicStorage.AddAsync(epic, ct);
        return epic;
    }

    /// <inheritdoc />
    public async Task<Result<Epic>> CloneEpicAsync(Guid userId, Guid templateId, CancellationToken ct = default) {
        var original = await epicStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");
        if (original.OwnerId != userId && !(original is { IsPublic: true, IsPublished: true }))
            return Result.Failure("NotAllowed");

        var allEpics = await GetEpicsAsync($"AvailableTo:{userId}", ct);
        var existingNames = allEpics.Select(e => e.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await epicStorage.UpdateAsync(renamedOriginal, ct);
        }

        var clone = original.Clone(userId, cloneName);
        await epicStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result<Epic>> UpdateEpicAsync(Guid userId, Guid id, UpdatedEpicData data, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        if (epic is null)
            return Result.Failure("NotFound");
        if (epic.OwnerId != userId)
            return Result.Failure("NotAllowed");
        var result = data.Validate();
        if (result.HasErrors)
            return result;
        epic = epic with {
            Name = data.Name.IsSet ? data.Name.Value : epic.Name,
            Description = data.Description.IsSet ? data.Description.Value : epic.Description,
            Background = data.BackgroundId.IsSet
                ? data.BackgroundId.Value.HasValue
                    ? await mediaStorage.GetByIdAsync(data.BackgroundId.Value.Value, ct)
                    : null
                : epic.Background,
            IsPublished = data.IsPublished.IsSet ? data.IsPublished.Value : epic.IsPublished,
            IsPublic = data.IsPublic.IsSet ? data.IsPublic.Value : epic.IsPublic,
        };
        await epicStorage.UpdateAsync(epic, ct);
        return epic;
    }

    /// <inheritdoc />
    public async Task<Result> DeleteEpicAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        if (epic is null)
            return Result.Failure("NotFound");
        if (epic.OwnerId != userId)
            return Result.Failure("NotAllowed");
        await epicStorage.DeleteAsync(id, ct);
        return Result.Success();
    }

    /// <inheritdoc />
    public async Task<Campaign[]> GetCampaignsAsync(Guid id, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        return epic?.Campaigns.ToArray() ?? [];
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> AddNewCampaignAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        if (epic is null)
            return Result.Failure("NotFound");
        if (epic.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var campaign = new Campaign {
            OwnerId = userId,
            EpicId = id,
        };
        epic.Campaigns.Add(campaign);
        await epicStorage.UpdateAsync(epic, ct);
        return campaign;
    }

    /// <inheritdoc />
    public async Task<Result<Campaign>> AddClonedCampaignAsync(Guid userId, Guid id, Guid templateId, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        if (epic is null)
            return Result.Failure("NotFound");
        if (epic.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var original = await campaignStorage.GetByIdAsync(templateId, ct);
        if (original is null)
            return Result.Failure("NotFound");

        var existingNames = epic.Campaigns.Select(c => c.Name);

        var (newOriginalName, cloneName) = NamingHelper.GenerateCloneNames(original.Name, existingNames);

        if (newOriginalName != original.Name && original.OwnerId == userId) {
            var renamedOriginal = original with { Name = newOriginalName };
            await campaignStorage.UpdateAsync(renamedOriginal, ct);
            original = renamedOriginal;
        }

        var clone = original.Clone(userId, cloneName) with { EpicId = id };
        epic.Campaigns.Add(clone);
        await epicStorage.UpdateAsync(epic, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Result> RemoveCampaignAsync(Guid userId, Guid id, Guid campaignId, CancellationToken ct = default) {
        var epic = await epicStorage.GetByIdAsync(id, ct);
        if (epic is null)
            return Result.Failure("NotFound");
        if (epic.OwnerId != userId)
            return Result.Failure("NotAllowed");

        var campaign = epic.Campaigns.FirstOrDefault(c => c.Id == campaignId);
        if (campaign is null)
            return Result.Failure("NotFound");

        epic.Campaigns.Remove(campaign);
        await epicStorage.UpdateAsync(epic, ct);
        return Result.Success();
    }
}
