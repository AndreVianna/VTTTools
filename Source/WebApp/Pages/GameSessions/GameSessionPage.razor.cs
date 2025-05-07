namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    [Parameter]
    public Guid GameSessionId { get; set; }

    internal GameSessionPageState State => Handler.State;
    internal GameSessionInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureComponentAsync() {
        if (await Handler.TryConfigureAsync(GameService, GameSessionId))
            return true;

        NavigateToGameSessions();
        return false;
    }

    internal void NavigateToGameSessions()
        => RedirectTo("/sessions");

    internal void OpenEditGameSessionDialog()
        => Handler.OpenEditGameSessionDialog();

    private void CloseEditGameSessionDialog()
        => Handler.CloseEditGameSessionDialog();

    internal Task UpdateGameSession()
        => Handler.UpdateGameSession();

    internal async Task StartGameSession() {
        if (!await Handler.TryStartGameSession())
            return;
        RedirectTo($"/game/{State.GameSession.Id}");
    }
}