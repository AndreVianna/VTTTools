namespace VttTools.WebApp.Services;

public class GameServiceClient(HttpClient client) {
    public HttpClient HttpClient { get; } = client;
    /// <summary>
    /// Retrieves all adventure templates.
    /// </summary>
    public async Task<Adventure[]> GetAdventuresAsync() {
        var adventures = await HttpClient.GetFromJsonAsync<Adventure[]>("/api/adventures");
        return adventures ?? [];
    }

    /// <summary>
    /// Creates a new adventure template.
    /// </summary>
    public async Task<Result<Guid>> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await HttpClient.PostAsJsonAsync("/api/adventures", request);
        return !response.IsSuccessStatusCode
            || !Guid.TryParse(await response.Content.ReadAsStringAsync(), out var adventureId)
                   ? Result.Failure("Failed to create adventure.")
                   : adventureId;
    }

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    public async Task<Result> UpdateAdventureAsync(Guid adventureId, UpdateAdventureRequest request) {
        var response = await HttpClient.PutAsJsonAsync($"/api/adventures/{adventureId}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    public async Task<bool> DeleteAdventureAsync(Guid adventureId) {
        var response = await HttpClient.DeleteAsync($"/api/adventures/{adventureId}");
        return response.IsSuccessStatusCode;
    }
    /// <summary>
    /// Retrieves all episodes for a given adventure.
    /// </summary>
    public async Task<Episode[]> GetEpisodesAsync(Guid adventureId) {
        var episodes = await HttpClient.GetFromJsonAsync<Episode[]>($"/api/adventures/{adventureId}/episodes");
        return episodes ?? [];
    }

    /// <summary>
    /// Creates a new episode template under an adventure.
    /// </summary>
    public async Task<Result<Guid>> CreateEpisodeAsync(Guid adventureId, CreateEpisodeRequest request) {
        var response = await HttpClient.PostAsJsonAsync($"/api/adventures/{adventureId}/episodes", request);
        return !response.IsSuccessStatusCode
         || !Guid.TryParse(await response.Content.ReadAsStringAsync(), out var assetId)
            ? Result.Failure("Failed to create episode.")
            : assetId;
    }

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    public async Task<Result> UpdateEpisodeAsync(Guid episodeId, UpdateEpisodeRequest request) {
        var response = await HttpClient.PutAsJsonAsync($"/api/episodes/{episodeId}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update episode.");
    }

    /// <summary>
    /// Deletes an episode template.
    /// </summary>
    public async Task<bool> DeleteEpisodeAsync(Guid episodeId) {
        var response = await HttpClient.DeleteAsync($"/api/episodes/{episodeId}");
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Clones an episode template.
    /// </summary>
    public async Task<Result<Guid>> CloneEpisodeAsync(Guid episodeId) {
        var response = await HttpClient.PostAsync($"/api/episodes/{episodeId}/clone", null);
        return !response.IsSuccessStatusCode
         || !Guid.TryParse(await response.Content.ReadAsStringAsync(), out var clonedEpisodeId)
            ? Result.Failure("Failed to clone episode.")
            : clonedEpisodeId;
    }

    /// <summary>
    /// Retrieves all asset templates.
    /// </summary>
    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await HttpClient.GetFromJsonAsync<Asset[]>("/api/assets");
        return assets ?? [];
    }

    /// <summary>
    /// Creates a new asset template.
    /// </summary>
    public async Task<Result<Guid>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await HttpClient.PostAsJsonAsync("/api/assets", request);
        return !response.IsSuccessStatusCode
         || !Guid.TryParse(await response.Content.ReadAsStringAsync(), out var assetId)
            ? Result.Failure("Failed to create asset.")
            : assetId;
    }

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    public async Task<Result> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request) {
        var response = await HttpClient.PutAsJsonAsync($"/api/assets/{assetId}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    public async Task<bool> DeleteAssetAsync(Guid assetId) {
        var response = await HttpClient.DeleteAsync($"/api/assets/{assetId}");
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Clones an adventure template.
    /// </summary>
    public async Task<Result<Guid>> CloneAdventureAsync(Guid adventureId) {
        var response = await HttpClient.PostAsync($"/api/adventures/{adventureId}/clone", null);
        return !response.IsSuccessStatusCode
         || !Guid.TryParse(await response.Content.ReadAsStringAsync(), out var clonedAdventureId)
            ? Result.Failure("Failed to clone adventure.")
            : clonedAdventureId;
    }
}