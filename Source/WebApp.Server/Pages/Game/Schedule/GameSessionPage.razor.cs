namespace VttTools.WebApp.Server.Pages.Game.Schedule;

public partial class GameSessionPage {
    [Inject]
    internal IGameHttpClient Client { get; set; } = null!;

    [Parameter]
    public Guid GameSessionId { get; set; }

    internal GameSessionPageState State { get; set; } = new();
    internal GameSessionInputModel Input => State.Input;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadSessionAsync(Client, GameSessionId);
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