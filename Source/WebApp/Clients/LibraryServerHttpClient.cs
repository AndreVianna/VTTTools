namespace VttTools.WebApp.Clients;

internal class LibraryServerHttpClient(HttpClient client, JsonSerializerOptions options)
    : ILibraryServerHttpClient {
    public async Task<AdventureListItem[]> GetAdventuresAsync() {
        //var json = await client.GetStringAsync("/api/adventures");
        //var test = JsonSerializer.Deserialize<Adventure[]>(json, options);
        var adventures = await client.GetFromJsonAsync<Adventure[]>("/api/adventures", options) ?? [];
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

    public async Task<AdventureInput?> GetAdventureByIdAsync(Guid id) {
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
        var response = await client.PutAsJsonAsync($"/api/adventures/{id}", request, options);
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

    public async Task<Result<Scene>> CreateSceneAsync(Guid id) {
        var response = await client.PostAsync($"/api/adventures/{id}/scenes", null);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>(options);
        return scene!;
    }

    public async Task<Result<Scene>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes/{templateId}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>(options);
        return scene!;
    }

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await client.PutAsJsonAsync($"/api/scenes/{id}", request, options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update scene.");
    }

    public async Task<bool> RemoveSceneAsync(Guid id, Guid sceneId) {
        var response = await client.DeleteAsync($"/api/adventures/{id}/scenes/{sceneId}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets", options);
        return assets ?? [];
    }
}