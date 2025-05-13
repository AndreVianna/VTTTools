namespace VttTools.WebApp.Clients;

internal class LibraryClient(HttpClient client)
    : ILibraryClient {
    public async Task<AdventureListItem[]> GetAdventuresAsync() {
        var adventures = await client.GetFromJsonAsync<Adventure[]>("/api/adventures") ?? [];
        return [.. adventures.Select(adventure => new AdventureListItem {
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            ImagePath = adventure.ImagePath,
            IsVisible = adventure.IsVisible,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        })];
    }

    public async Task<AdventureInputModel?> GetAdventureByIdAsync(Guid id) {
        var adventure = await client.GetFromJsonAsync<Adventure>($"/api/adventures/{id}");
        return adventure == null ? null : new() {
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            ImagePath = adventure.ImagePath,
            IsVisible = adventure.IsVisible,
            IsPublic = adventure.IsPublic,
        };
    }

    public async Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await client.PostAsJsonAsync("/api/adventures", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create adventure.");
        var adventure = IsNotNull(await response.Content.ReadFromJsonAsync<Adventure>());
        return new AdventureListItem {
            Id = adventure.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            ImagePath = adventure.ImagePath,
            IsVisible = adventure.IsVisible,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        };
    }

    public async Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/clone", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone adventure.");
        var adventure = await response.Content.ReadFromJsonAsync<Adventure>();
        return new AdventureListItem {
            Id = adventure!.Id,
            Name = adventure.Name,
            Description = adventure.Description,
            Type = adventure.Type,
            ImagePath = adventure.ImagePath,
            IsVisible = adventure.IsVisible,
            IsPublic = adventure.IsPublic,
            OwnerId = adventure.OwnerId,
            ScenesCount = adventure.Scenes.Count,
        };
    }

    public async Task<Result> UpdateAdventureAsync(Guid id, UpdateAdventureRequest request) {
        var response = await client.PutAsJsonAsync($"/api/adventures/{id}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    public async Task<bool> DeleteAdventureAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/adventures/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Scene[]> GetScenesAsync(Guid id) {
        var scenes = await client.GetFromJsonAsync<Scene[]>($"/api/adventures/{id}/scenes");
        return scenes ?? [];
    }

    public async Task<Result<Scene>> CreateSceneAsync(Guid id, CreateSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>();
        return scene!;
    }

    public async Task<Result<Scene>> CloneSceneAsync(Guid id, AddClonedSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes/clone", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>();
        return scene!;
    }

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await client.PutAsJsonAsync($"/api/scenes/{id}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update scene.");
    }

    public async Task<bool> RemoveSceneAsync(Guid id, Guid sceneId) {
        var response = await client.DeleteAsync($"/api/adventures/{id}/scenes/{sceneId}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets");
        return assets ?? [];
    }
}