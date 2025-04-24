namespace VttTools.WebApp.Services;

internal class GameServiceClient(HttpClient client)
    : IGameServiceClient {
    public async Task<Adventure[]> GetAdventuresAsync() {
        var adventures = await client.GetFromJsonAsync<Adventure[]>("/api/adventures");
        return adventures ?? [];
    }

    public async Task<Result<Adventure>> CreateAdventureAsync(CreateAdventureRequest request) {
        var response = await client.PostAsJsonAsync("/api/adventures", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create adventure.");
        var adventure = await response.Content.ReadFromJsonAsync<Adventure>();
        return adventure!;
    }

    public async Task<Result<Adventure>> CloneAdventureAsync(Guid id, CloneAdventureRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{id}/clone", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone adventure.");
        var adventure = await response.Content.ReadFromJsonAsync<Adventure>();
        return adventure!;
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

    public async Task<Episode[]> GetEpisodesAsync(Guid adventureId) {
        var episodes = await client.GetFromJsonAsync<Episode[]>($"/api/adventures/{adventureId}/episodes");
        return episodes ?? [];
    }

    public async Task<Result<Episode>> CreateEpisodeAsync(CreateEpisodeRequest request) {
        var response = await client.PostAsJsonAsync($"/api/adventures/{request.AdventureId}/episodes", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create episode.");
        var episode = await response.Content.ReadFromJsonAsync<Episode>();
        return episode!;
    }

    public async Task<Result<Episode>> CloneEpisodeAsync(Guid id, CloneEpisodeRequest request) {
        var response = await client.PostAsJsonAsync($"/api/episodes/{id}/clone", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to clone episode.");
        var episode = await response.Content.ReadFromJsonAsync<Episode>();
        return episode!;
    }

    public async Task<Result> UpdateEpisodeAsync(Guid id, UpdateEpisodeRequest request) {
        var response = await client.PutAsJsonAsync($"/api/episodes/{id}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update episode.");
    }

    public async Task<bool> DeleteEpisodeAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/episodes/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Asset[]> GetAssetsAsync() {
        var assets = await client.GetFromJsonAsync<Asset[]>("/api/assets");
        return assets ?? [];
    }

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await client.PostAsJsonAsync("/api/assets", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset.");
        var asset = await response.Content.ReadFromJsonAsync<Asset>();
        return asset!;
    }

    public async Task<Result> UpdateAssetAsync(Guid id, UpdateAssetRequest request) {
        var response = await client.PutAsJsonAsync($"/api/assets/{id}", request);
        return response.IsSuccessStatusCode
                   ? Result.Success()
                   : Result.Failure("Failed to update adventure.");
    }

    public async Task<bool> DeleteAssetAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/assets/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<Meeting[]> GetMeetingsAsync() {
        var meetings = await client.GetFromJsonAsync<Meeting[]>("/api/meetings");
        return meetings ?? [];
    }

    public async Task<Meeting?> GetMeetingByIdAsync(Guid id) {
        var meeting = await client.GetFromJsonAsync<Meeting>($"/api/meetings/{id}");
        return meeting;
    }

    public async Task<Result<Meeting>> CreateMeetingAsync(CreateMeetingRequest request) {
        var response = await client.PostAsJsonAsync("/api/meetings", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create meeting.");
        var meeting = await response.Content.ReadFromJsonAsync<Meeting>();
        return meeting!;
    }

    public async Task<bool> UpdateMeetingAsync(Guid id, UpdateMeetingRequest request) {
        var response = await client.PutAsJsonAsync($"/api/meetings/{id}", request);
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> DeleteMeetingAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/meetings/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> JoinMeetingAsync(Guid id) {
        var response = await client.PostAsync($"/api/meetings/{id}/join", null);
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> StartMeetingAsync(Guid id) {
        var response = await client.PostAsync($"/api/meetings/{id}/start", null);
        return response.IsSuccessStatusCode;
    }
}