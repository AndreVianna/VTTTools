namespace WebApp.Services;

public class GameServiceClient(HttpClient client) {
    public HttpClient HttpClient { get; } = client;
    /// <summary>
    /// Retrieves all adventure templates.
    /// </summary>
    public async Task<Adventure[]> GetAdventuresAsync()
    {
        var adventures = await HttpClient.GetFromJsonAsync<Adventure[]>("/api/adventures");
        return adventures ?? Array.Empty<Adventure>();
    }

    /// <summary>
    /// Creates a new adventure template.
    /// </summary>
    public async Task<Adventure?> CreateAdventureAsync(CreateAdventureRequest request)
    {
        var response = await HttpClient.PostAsJsonAsync("/api/adventures", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Adventure>();
        return null;
    }

    /// <summary>
    /// Updates an existing adventure template.
    /// </summary>
    public async Task<Adventure?> UpdateAdventureAsync(Guid adventureId, UpdateAdventureRequest request)
    {
        var response = await HttpClient.PutAsJsonAsync($"/api/adventures/{adventureId}", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Adventure>();
        return null;
    }

    /// <summary>
    /// Deletes an adventure template.
    /// </summary>
    public async Task<bool> DeleteAdventureAsync(Guid adventureId)
    {
        var response = await HttpClient.DeleteAsync($"/api/adventures/{adventureId}");
        return response.IsSuccessStatusCode;
    }
    /// <summary>
    /// Retrieves all episodes for a given adventure.
    /// </summary>
    public async Task<Episode[]> GetEpisodesAsync(Guid adventureId)
    {
        var episodes = await HttpClient.GetFromJsonAsync<Episode[]>($"/api/adventures/{adventureId}/episodes");
        return episodes ?? Array.Empty<Episode>();
    }

    /// <summary>
    /// Creates a new episode template under an adventure.
    /// </summary>
    public async Task<Episode?> CreateEpisodeAsync(Guid adventureId, CreateEpisodeRequest request)
    {
        var response = await HttpClient.PostAsJsonAsync($"/api/adventures/{adventureId}/episodes", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Episode>();
        return null;
    }

    /// <summary>
    /// Updates an existing episode template.
    /// </summary>
    public async Task<Episode?> UpdateEpisodeAsync(Guid episodeId, UpdateEpisodeRequest request)
    {
        var response = await HttpClient.PutAsJsonAsync($"/api/episodes/{episodeId}", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Episode>();
        return null;
    }

    /// <summary>
    /// Deletes an episode template.
    /// </summary>
    public async Task<bool> DeleteEpisodeAsync(Guid episodeId)
    {
        var response = await HttpClient.DeleteAsync($"/api/episodes/{episodeId}");
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Clones an episode template.
    /// </summary>
    public async Task<Episode?> CloneEpisodeAsync(Guid episodeId)
    {
        var response = await HttpClient.PostAsync($"/api/episodes/{episodeId}/clone", null);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Episode>();
        return null;
    }
    
    /// <summary>
    /// Retrieves all asset templates.
    /// </summary>
    public async Task<Asset[]> GetAssetsAsync()
    {
        var assets = await HttpClient.GetFromJsonAsync<Asset[]>("/api/assets");
        return assets ?? Array.Empty<Asset>();
    }

    /// <summary>
    /// Creates a new asset template.
    /// </summary>
    public async Task<Asset?> CreateAssetAsync(CreateAssetRequest request)
    {
        var response = await HttpClient.PostAsJsonAsync("/api/assets", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Asset>();
        return null;
    }

    /// <summary>
    /// Updates an existing asset template.
    /// </summary>
    public async Task<Asset?> UpdateAssetAsync(Guid assetId, UpdateAssetRequest request)
    {
        var response = await HttpClient.PutAsJsonAsync($"/api/assets/{assetId}", request);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Asset>();
        return null;
    }

    /// <summary>
    /// Deletes an asset template.
    /// </summary>
    public async Task<bool> DeleteAssetAsync(Guid assetId)
    {
        var response = await HttpClient.DeleteAsync($"/api/assets/{assetId}");
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Clones an adventure template.
    /// </summary>
    public async Task<Adventure?> CloneAdventureAsync(Guid adventureId)
    {
        var response = await HttpClient.PostAsync($"/api/adventures/{adventureId}/clone", null);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Adventure>();
        return null;
    }
}