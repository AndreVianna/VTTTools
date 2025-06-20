namespace VttTools.WebApp.Pages.Game.Schedule.List;

public partial class GameSessionsPage {
    [Inject]
    internal IGameSessionsHttpClient GameSessions { get; set; } = null!;

    internal GameSessionsPageState State { get; set; } = new();

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadGameSessionAsync(GameSessions);
    }

    internal void NavigateToGameSession(Guid sessionId)
        => RedirectTo($"/sessions/{sessionId}");

    internal Task DeleteGameSession(Guid sessionId)
        => Handler.DeleteGameSession(sessionId);

    internal async Task JoinGameSession(Guid sessionId) {
        if (!await Handler.TryJoinGameSession(sessionId))
            return;
        RedirectTo($"/sessions/{sessionId}/join");
    }

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}