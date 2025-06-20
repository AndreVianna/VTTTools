namespace VttTools.WebApp.Clients;

public class GameSessionsHttpClient(HttpClient client, JsonSerializerOptions options)
    : IGameSessionsHttpClient {
    public async Task<GameSessionListItem[]> GetGameSessionsAsync() {
        var sessions = IsNotNull(await client.GetFromJsonAsync<GameSession[]>("/api/sessions", options));
        return [.. sessions.Select(s => s.ToListItem())];
    }

    public async Task<GameSessionDetails?> GetGameSessionByIdAsync(Guid id) {
        var session = await client.GetFromJsonAsync<GameSession>($"/api/sessions/{id}", options);
        return session.ToDetails();
    }

    public async Task<Result<GameSessionListItem>> CreateGameSessionAsync(CreateGameSessionRequest request) {
        var response = await client.PostAsJsonAsync("/api/sessions", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create session.");
        var session = IsNotNull(await response.Content.ReadFromJsonAsync<GameSession>(options));
        return session.ToListItem();
    }

    public async Task<Result> UpdateGameSessionAsync(Guid id, UpdateGameSessionRequest request) {
        var response = await client.PatchAsJsonAsync($"/api/sessions/{id}", request, options);
        return !response.IsSuccessStatusCode
            ? Result.Failure("Failed to update session.")
            : Result.Success();
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