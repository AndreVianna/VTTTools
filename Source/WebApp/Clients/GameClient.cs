namespace VttTools.WebApp.Clients;

internal class GameClient(HttpClient client)
    : IGameClient {
    public async Task<GameSession[]> GetGameSessionsAsync() {
        var sessions = await client.GetFromJsonAsync<GameSession[]>("/api/sessions");
        return sessions ?? [];
    }

    public async Task<GameSession?> GetGameSessionByIdAsync(Guid id) {
        var session = await client.GetFromJsonAsync<GameSession>($"/api/sessions/{id}");
        return session;
    }

    public async Task<Result<GameSession>> CreateGameSessionAsync(CreateGameSessionRequest request) {
        var response = await client.PostAsJsonAsync("/api/sessions", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create session.");
        var session = await response.Content.ReadFromJsonAsync<GameSession>();
        return session!;
    }

    public async Task<Result<GameSession>> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request) {
        var response = await client.PutAsJsonAsync($"/api/sessions/{id}", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to update session.");
        var session = await response.Content.ReadFromJsonAsync<GameSession>();
        return session!;
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