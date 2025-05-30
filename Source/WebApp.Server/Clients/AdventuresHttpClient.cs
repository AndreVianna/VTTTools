namespace VttTools.WebApp.Server.Clients;

public class AdventuresHttpClient(HttpClient client, JsonSerializerOptions options)
    : IAdventuresHttpClient {
    public async Task<AdventureListItem[]> GetAdventuresAsync() {
        var adventures = IsNotNull(await client.GetFromJsonAsync<Adventure[]>("/api/adventures", options));
        return [.. adventures.Select(a => a.ToListItem())];
    }

    public async Task<AdventureDetails?> GetAdventureByIdAsync(Guid id) {
        var adventure = await client.GetFromJsonAsync<Adventure>($"/api/adventures/{id}", options);
        return adventure.ToDetails();
    }

    public async Task<Result<AdventureListItem>> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await client.PostAsJsonAsync("/api/adventures", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create adventure.");
        var adventure = IsNotNull(await response.Content.ReadFromJsonAsync<Adventure>(options));
        return adventure.ToListItem();
    }

    public async Task<Result<AdventureListItem>> CloneAdventureAsync(Guid id, CloneAdventureRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone adventure.");
        var adventure = IsNotNull(await response.Content.ReadFromJsonAsync<Adventure>(options));
        return adventure.ToListItem();
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
        return [.. scenes.Select(scene => scene.ToListItem())];
    }

    public async Task<Result<SceneDetails>> CreateSceneAsync(Guid id) {
        var response = await client.PostAsync($"/api/adventures/{id}/scenes", null);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create scene.");
        var scene = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>(options));
        return scene.ToDetails();
    }

    public async Task<Result<SceneDetails>> CloneSceneAsync(Guid id, Guid templateId, CloneSceneRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/scenes/{templateId}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone scene.");
        var scene = IsNotNull(await response.Content.ReadFromJsonAsync<Scene>(options));
        return scene.ToDetails();
    }

    public async Task<string> UploadAdventureFileAsync(Guid id, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await client.PostAsync($"api/adventures/{id}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<bool> DeleteSceneAsync(Guid id, Guid sceneId) {
        var response = await client.DeleteAsync($"/api/adventures/{id}/scenes/{sceneId}");
        return response.IsSuccessStatusCode;
    }
}