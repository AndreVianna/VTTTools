namespace WebApp.Services;

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
    public async Task<Adventure?> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await HttpClient.PostAsJsonAsync("/api/adventures", request);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Adventure>() : null;
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
    public async Task<Episode?> CreateEpisodeAsync(Guid adventureId, CreateEpisodeRequest request) {
        var response = await HttpClient.PostAsJsonAsync($"/api/adventures/{adventureId}/episodes", request);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Episode>() : null;
    }

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    public async Task<Episode?> UpdateEpisodeAsync(Guid episodeId, UpdateEpisodeRequest request) {
        var response = await HttpClient.PutAsJsonAsync($"/api/episodes/{episodeId}", request);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Episode>() : null;
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
    public async Task<Episode?> CloneEpisodeAsync(Guid episodeId) {
        var response = await HttpClient.PostAsync($"/api/episodes/{episodeId}/clone", null);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Episode>() : null;
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
    public async Task<Asset?> CreateAssetAsync(CreateAssetRequest request) {
        var response = await HttpClient.PostAsJsonAsync("/api/assets", request);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Asset>() : null;
    }

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    public async Task<Asset?> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request) {
        var response = await HttpClient.PutAsJsonAsync($"/api/assets/{assetId}", request);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Asset>() : null;
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
    public async Task<Adventure?> CloneAdventureAsync(Guid adventureId) {
        var response = await HttpClient.PostAsync($"/api/adventures/{adventureId}/clone", null);
        return response.IsSuccessStatusCode ? await response.Content.ReadFromJsonAsync<Adventure>() : null;
    }
}