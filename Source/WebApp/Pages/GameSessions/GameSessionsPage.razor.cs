namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionsPage {
    [Inject]
    internal IGameClient GameClient { get; set; } = null!;
    [Inject]
    internal ILibraryClient LibraryClient { get; set; } = null!;

    internal GameSessionsPageState State => Handler.State;
    internal GameSessionsInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await Handler.LoadGameSessionAsync(GameClient, LibraryClient);
        return true;
    }

    internal void NavigateToGameSession(Guid sessionId)
        => this.RedirectTo($"/sessions/{sessionId}");

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
        this.RedirectTo($"/sessions/{sessionId}/join");
    }

    internal Task OnAdventureChanged(ChangeEventArgs e)
        => Handler.LoadScenes((Guid)e.Value!);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}