namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal GameSessionsPageState State => Handler.State;
    internal GameSessionsInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(GameService);
        return true;
    }

    internal void NavigateToGameSession(Guid sessionId)
        => RedirectTo($"/sessions/{sessionId}");

    internal Task ShowCreateDialog()
        => Handler.StartGameSessionCreating();

    internal void HideCreateDialog()
        => Handler.EndGameSessionCreating();

    internal Task CreateGameSession()
        => Handler.SaveCreatedGameSession();

    internal Task DeleteGameSession(Guid sessionId)
        => Handler.DeleteGameSession(sessionId);

    internal async Task JoinGameSession(Guid sessionId) {
        if (!await Handler.TryJoinGameSession(sessionId))
            return;
        RedirectTo($"/sessions/{sessionId}/join");
    }

    internal Task OnAdventureChanged(ChangeEventArgs e)
        => Handler.LoadScenes((Guid)e.Value!);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}