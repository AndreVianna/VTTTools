using VttTools.WebApp.Contracts.Library.Adventure;
using VttTools.WebApp.Contracts.Library.Scenes;

using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Clients;

internal class ServerLibraryHttpClient(HttpClient client, JsonSerializerOptions options)
    : ILibraryHttpClient {
    public async Task<AdventureListItem[]> GetAdventuresAsync() {
        var adventures = IsNotNull(await client.GetFromJsonAsync<Adventure[]>("/api/adventures", options));
        return [.. adventures.Select(adventure => new AdventureListItem {
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        })];
    }

    public async Task<AdventureDetails?> GetAdventureByIdAsync(Guid id) {
        var adventure = await client.GetFromJsonAsync<Adventure>($"/api/adventures/{id}", options);
        return adventure == null ? null : new() {
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            Scenes = [.. adventure.Scenes.Select(scene => new SceneListItem {
                Id = scene.Id,
                Name = scene.Name,
            })],
        };
    }

    public async Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await client.PostAsJsonAsync("/api/adventures", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create adventure.");
        var adventure = IsNotNull(await response.Content.ReadFromJsonAsync<Adventure>(options));
        return new AdventureListItem {
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        };
    }

    public async Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone adventure.");
        var adventure = await response.Content.ReadFromJsonAsync<Adventure>(options);
        return new AdventureListItem {
            Id = adventure!.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            IsPublished = adventure.IsPublished,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        };
    }

    public async Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request) {
        var response = await client.PatchAsJsonAsync($"/api/adventures/{id}", request, options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    public async Task<bool> DeleteAdventureAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/adventures/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<SceneListItem[]> GetScenesAsync(Guid id) {
        var scenes = await client.GetFromJsonAsync<Scene[]>($"/api/adventures/{id}/scenes", options) ?? [];
        return [.. scenes.Select(scene => new SceneListItem {
            Id = scene.Id,
            Name = scene.Name,
        })];
    }

    public Task<SceneDetails?> GetSceneByIdAsync(Guid id) => throw new NotImplementedException();

    public async Task<Result<SceneDetails>> CreateSceneAsync(Guid id) {
        var response = await client.PostAsync($"/api/adventures/{id}/scenes", null);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create scene.");
        var scene = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>(options));
        return new SceneDetails {
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Stage = new() {
                Id = scene.Stage.Id?.ToString() ?? scene.Id.ToString(),
                Type = scene.Stage.Type,
                Size = scene.Stage.Size,
                ZoomLevel = scene.ZoomLevel,
            },
            Grid = new() {
                Type = scene.Grid.Type,
                CellSize = scene.Grid.CellSize,
                Offset = scene.Grid.Offset,
                Snap = scene.Grid.Snap,
            },
            ZoomLevel = scene.ZoomLevel,
            Assets = [.. scene.Assets.Select(asset => new SceneAssetDetails {
                Id = asset.Id,
                Name = asset.Name,
            })],
        };
    }

    public async Task<Result<SceneDetails>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes/{templateId}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone scene.");
        var scene = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>(options));
        return new SceneDetails {
            Name = scene.Name,
            Description = scene.Description,
            IsPublished = scene.IsPublished,
            Assets = [.. scene.Assets.Select(asset => new SceneAssetDetails {
                Id = asset.Id,
                Name = asset.Name,
            })],
        };
    }

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await client.PatchAsJsonAsync($"/api/scenes/{id}", request, options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update scene.");
    }

    public async Task<bool> DeleteSceneAsync(Guid id, Guid sceneId) {
        var response = await client.DeleteAsync($"/api/adventures/{id}/scenes/{sceneId}");
        return response.IsSuccessStatusCode;
    }

    public Task<Result<SceneAssetDetails>> AddSceneAssetAsync(Guid sceneId, AddAssetRequest request) => throw new NotImplementedException();

    public Task<Result> UpdateSceneAssetAsync(Guid sceneId, Guid assetId, uint number, UpdateAssetRequest request) => throw new NotImplementedException();

    public Task<bool> RemoveSceneAssetAsync(Guid sceneId, Guid assetId, uint number) => throw new NotImplementedException();
}