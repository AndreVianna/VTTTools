namespace VttTools.WebApp.Pages.Game.Schedule.List;

public sealed class GameSessionsPageHandler(GameSessionsPage page)
    : PageHandler<GameSessionsPageHandler, GameSessionsPage>(page) {
    private IGameSessionsHttpClient _client = null!;

    public async Task LoadGameSessionAsync(IGameSessionsHttpClient client) {
        _client = client;
        var data = await client.GetGameSessionsAsync();
        Page.State.GameSessions = [.. data];
    }

    public Task<bool> TryJoinGameSession(Guid sessionId)
        => _client.JoinGameSessionAsync(sessionId);

    public async Task DeleteGameSession(Guid sessionId) {
        if (!await GameSessionsPage.DisplayConfirmation("Are you sure you want to delete this game session?"))
            return;

        var sessionToRemove = Page.State.GameSessions.FirstOrDefault(s => s.Id == sessionId);
        if (sessionToRemove == null)
            return;
        await _client.DeleteGameSessionAsync(sessionId);
        Page.State.GameSessions.Remove(sessionToRemove);
    }
}