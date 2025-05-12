namespace VttTools.Library.Services;

/// <summary>
/// Implements IAdventureService using EF Core storage.
/// </summary>
public class AdventureService(IAdventureStorage adventureStorage, ISceneStorage sceneStorage)
    : IAdventureService {
    /// <inheritdoc />
    public Task<Adventure[]> GetAdventuresAsync(CancellationToken ct = default)
        => adventureStorage.GetAllAsync(ct);

    /// <inheritdoc />
    public Task<Adventure?> GetAdventureByIdAsync(Guid id, CancellationToken ct = default)
        => adventureStorage.GetByIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<Adventure?> CreateAdventureAsync(Guid userId, CreateAdventureData data, CancellationToken ct = default) {
        if (string.IsNullOrWhiteSpace(data.Name))
            return null;
        var adventure = new Adventure {
            OwnerId = userId,
            ParentId = data.CampaignId,
            Name = data.Name,
            Visibility = data.Visibility,
        };
        return await adventureStorage.AddAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<Adventure?> CloneAdventureAsync(Guid userId, Guid templateId, CloneAdventureData data, CancellationToken ct = default) {
        var original = await adventureStorage.GetByIdAsync(templateId, ct);
        if (original?.OwnerId != userId)
            return null;
        var clone = Cloner.CloneAdventure(original, userId);
        if (data.CampaignId.IsSet)
            clone.ParentId = data.CampaignId.Value;
        if (data.Name.IsSet)
            clone.Name = data.Name.Value;
        await adventureStorage.AddAsync(clone, ct);
        return clone;
    }

    /// <inheritdoc />
    public async Task<Adventure?> UpdateAdventureAsync(Guid userId, Guid id, UpdateAdventureData data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure?.OwnerId != userId)
            return null;
        if (data.Name.IsSet)
            adventure.Name = data.Name.Value;
        if (data.Visibility.IsSet)
            adventure.Visibility = data.Visibility.Value;
        return await adventureStorage.UpdateAsync(adventure, ct);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAdventureAsync(Guid userId, Guid id, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        return adventure?.OwnerId == userId
            && await adventureStorage.DeleteAsync(id, ct);
    }

    /// <inheritdoc />
    public Task<Scene[]> GetScenesAsync(Guid id, CancellationToken ct = default)
        => sceneStorage.GetByParentIdAsync(id, ct);

    /// <inheritdoc />
    public async Task<bool> CreateSceneAsync(Guid userId, Guid id, CreateSceneData data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure?.OwnerId != userId)
            return false;
        var scene = new Scene {
            OwnerId = userId,
            ParentId = id,
            Name = data.Name,
            Visibility = data.Visibility,
            IsTemplate = true,
        };
        await sceneStorage.AddAsync(scene, ct);
        adventure.Scenes.Add(scene);
        await adventureStorage.UpdateAsync(adventure, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> AddClonedSceneAsync(Guid userId, Guid id, AddClonedSceneData data, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure?.OwnerId != userId)
            return false;
        var scene = await sceneStorage.GetByIdAsync(data.SceneId, ct);
        if (scene is null)
            return false;
        var clone = Cloner.CloneScene(scene, adventure.Id, userId);
        if (data.Name.IsSet)
            clone.Name = data.Name.Value;
        adventure.Scenes.Add(clone);
        await adventureStorage.UpdateAsync(adventure, ct);
        return true;
    }

    /// <inheritdoc />
    public async Task<bool> RemoveSceneAsync(Guid userId, Guid id, Guid sceneId, CancellationToken ct = default) {
        var adventure = await adventureStorage.GetByIdAsync(id, ct);
        if (adventure?.OwnerId != userId)
            return false;
        adventure.Scenes.RemoveAll(e => e.Id == sceneId);
        await adventureStorage.UpdateAsync(adventure, ct);
        return true;
    }
}