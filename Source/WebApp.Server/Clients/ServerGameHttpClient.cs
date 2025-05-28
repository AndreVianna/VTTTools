namespace VttTools.WebApp.Server.Clients;

public class ServerGameHttpClient(HttpClient client, JsonSerializerOptions options)
    : IGameHttpClient {
    public async Task<GameSession[]> GetGameSessionsAsync() {
        var sessions = IsNotNull(await client.GetFromJsonAsync<GameSession[]>("/api/sessions", options));
        return sessions;
    }

    public Task<GameSession?> GetGameSessionByIdAsync(Guid id)
        => client.GetFromJsonAsync<GameSession>($"/api/sessions/{id}", options);

    public async Task<Result<GameSession>> CreateGameSessionAsync(CreateGameSessionRequest request) {
        var response = await client.PostAsJsonAsync("/api/sessions", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create session.");
        var session = IsNotNull(await response.Content.ReadFromJsonAsync<GameSession>(options));
        return session;
    }

    public async Task<Result<GameSession>> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request) {
        var response = await client.PatchAsJsonAsync($"/api/sessions/{id}", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update session.");
        var session = IsNotNull(await response.Content.ReadFromJsonAsync<GameSession>(options));
        return session;
    }

    public async Task<bool> DeleteGameSessionAsync(Guid id) {
        var response = await client.DeleteAsync($"/api/sessions/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> JoinGameSessionAsync(Guid id) {
        var response = await client.PostAsync($"/api/sessions/{id}/join", null);
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> StartGameSessionAsync(Guid id) {
        var response = await client.PostAsync($"/api/sessions/{id}/start", null);
        return response.IsSuccessStatusCode;
    }
}