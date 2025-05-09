namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionPage {
    [Inject]
    internal IGameClient GameClient { get; set; } = null!;

    [Parameter]
    public Guid GameSessionId { get; set; }

    internal GameSessionPageState State => Handler.State;
    internal GameSessionInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        if (await Handler.TryLoadSessionAsync(GameClient, GameSessionId))
            return true;
        NavigateToGameSessions();
        return false;
    }

    internal void NavigateToGameSessions()
        => this.RedirectTo("/sessions");

    internal void OpenEditGameSessionDialog()
        => Handler.OpenEditGameSessionDialog();

    private void CloseEditGameSessionDialog()
        => Handler.CloseEditGameSessionDialog();

    internal Task UpdateGameSession()
        => Handler.UpdateGameSession();

    internal async Task StartGameSession() {
        if (!await Handler.TryStartGameSession())
            return;
        this.RedirectTo($"/game/{State.GameSession.Id}");
    }
}