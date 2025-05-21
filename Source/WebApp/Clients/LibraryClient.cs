namespace VttTools.WebApp.Clients;

internal class LibraryClient(HttpClient client, IOptions<JsonOptions> options)
    : ILibraryClient {
    private readonly JsonSerializerOptions _options = options.Value.JsonSerializerOptions;

    public async Task<AdventureListItem[]> GetAdventuresAsync() {
        //var json = await client.GetStringAsync("/api/adventures");
        //var test = JsonSerializer.Deserialize<Adventure[]>(json, _options);
        var adventures = await client.GetFromJsonAsync<Adventure[]>("/api/adventures", _options) ?? [];
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

    public async Task<AdventureInputModel?> GetAdventureByIdAsync(Guid id) {
        var adventure = await client.GetFromJsonAsync<Adventure>($"/api/adventures/{id}", _options);
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
        var response = await client.PostAsJsonAsync("/api/adventures", request, _options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create adventure.");
        var adventure = IsNotNull(await response.Content.ReadFromJsonAsync<Adventure>(_options));
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
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/clone", request, _options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone adventure.");
        var adventure = await response.Content.ReadFromJsonAsync<Adventure>(_options);
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
        var response = await client.PutAsJsonAsync($"/api/adventures/{id}", request, _options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    public async Task<bool> DeleteAdventureAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/adventures/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<SceneListItem[]> GetScenesAsync(Guid id) {
        var scenes = await client.GetFromJsonAsync<Scene[]>($"/api/adventures/{id}/scenes", _options) ?? [];
        return [.. scenes.Select(scene => new SceneListItem {
            Id = scene.Id,
            Name = scene.Name,
        })];
    }

    public async Task<Result<Scene>> CreateSceneAsync(Guid id, AddNewSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes", request, _options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>(_options);
        return scene!;
    }

    public async Task<Result<Scene>> CloneSceneAsync(Guid id, AddClonedSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes/clone", request, _options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone scene.");
        var scene = await response.Content.ReadFromJsonAsync<Scene>(_options);
        return scene!;
    }

    public async Task<Result> UpdateSceneAsync(Guid id, UpdateSceneRequest request) {
        var response = await client.PutAsJsonAsync($"/api/scenes/{id}", request, _options);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update scene.");
    }

    public async Task<bool> RemoveSceneAsync(Guid id, Guid sceneId) {
        var response = await client.DeleteAsync($"/api/adventures/{id}/scenes/{sceneId}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets", _options);
        return assets ?? [];
    }
}