namespace VttTools.WebApp.Pages.Game.Schedule;

public partial class GameSessionsPage {
    [Inject]
    internal IGameServerHttpClient GameServerHttpClient { get; set; } = null!;
    [Inject]
    internal ILibraryServerHttpClient LibraryServerHttpClient { get; set; } = null!;

    internal GameSessionsPageState State { get; set; } = new();
    internal GameSessionsInputModel Input => State.Input;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadGameSessionAsync(GameServerHttpClient, LibraryServerHttpClient);
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