namespace VttTools.WebApp.Pages.Game.Schedule;

public partial class GameSessionPage {
    [Inject]
    internal IGameClient GameClient { get; set; } = null!;

    [Parameter]
    public Guid GameSessionId { get; set; }

    internal GameSessionPageState State { get; set; } = new();
    internal GameSessionInputModel Input => State.Input;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadSessionAsync(GameClient, GameSessionId);
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