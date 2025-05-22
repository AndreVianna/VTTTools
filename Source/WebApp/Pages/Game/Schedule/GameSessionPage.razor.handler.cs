namespace VttTools.WebApp.Pages.Game.Schedule;

public class GameSessionPageHandler(GameSessionPage page)
    : PageHandler<GameSessionPageHandler, GameSessionPage>(page) {
    private IGameServerHttpClient _serverHttpClient = null!;

    public async Task LoadSessionAsync(IGameServerHttpClient serverHttpClient, Guid sessionId) {
        _serverHttpClient = serverHttpClient;
        var session = await _serverHttpClient.GetGameSessionByIdAsync(sessionId);
        if (session == null) return;
        Page.State.GameSession = session;
        Page.State.CanEdit = session.OwnerId == Page.User!.Id;
        Page.State.CanStart = session.Players.FirstOrDefault(p => p.UserId == Page.User.Id)?.Type == PlayerType.Master;
    }

    public void OpenEditGameSessionDialog() {
        Page.State.Input = new() { Title = Page.State.GameSession.Title };
        Page.State.ShowEditDialog = true;
    }

    public void CloseEditGameSessionDialog()
        => Page.State.ShowEditDialog = false;

    public async Task UpdateGameSession() {
        var request = new UpdateGameSessionRequest {
            Title = Page.State.Input.Title,
        };
        var result = await _serverHttpClient.UpdateGameSessionAsync(Page.State.GameSession.Id, request);
        if (result.HasErrors) {
            Page.State.Input.Errors = [.. result.Errors];
            return;
        }
        Page.State.GameSession = result.Value;
        Page.State.CanEdit = Page.State.GameSession.OwnerId == Page.User!.Id;
        Page.State.CanStart = Page.State.GameSession.Players.FirstOrDefault(p => p.UserId == Page.User.Id)?.Type == PlayerType.Master;
        CloseEditGameSessionDialog();
    }

    public Task<bool> TryStartGameSession()
        => _serverHttpClient.StartGameSessionAsync(Page.State.GameSession.Id);
}