namespace VttTools.WebApp.Pages.Game.Schedule;

public class GameSessionPageHandler(IAuthenticatedPage component)
    : AuthenticatedPageHandler<GameSessionPageHandler>(component) {
    private IGameClient _client = null!;

    internal GameSessionPageState State { get; } = new();

    public Task<bool> TryLoadSessionAsync(IGameClient client, Guid sessionId) {
        _client = client;
        return TryLoadGameSessionDetails(sessionId);
    }

    private async Task<bool> TryLoadGameSessionDetails(Guid sessionId) {
        var session = await _client.GetGameSessionByIdAsync(sessionId);
        if (session == null)
            return false;
        State.GameSession = session;
        State.CanEdit = session.OwnerId == Page.UserId;
        State.CanStart = session.Players.FirstOrDefault(p => p.UserId == Page.UserId)?.Type == PlayerType.Master;
        return true;
    }

    public void OpenEditGameSessionDialog() {
        State.Input = new() { Title = State.GameSession.Title };
        State.ShowEditDialog = true;
    }

    public void CloseEditGameSessionDialog()
        => State.ShowEditDialog = false;

    public async Task UpdateGameSession() {
        var request = new UpdateGameSessionRequest {
            Title = State.Input.Title,
        };
        var result = await _client.UpdateGameSessionAsync(State.GameSession.Id, request);
        if (result.HasErrors) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.GameSession = result.Value;
        State.CanEdit = State.GameSession.OwnerId == Page.UserId;
        State.CanStart = State.GameSession.Players.FirstOrDefault(p => p.UserId == Page.UserId)?.Type == PlayerType.Master;
        CloseEditGameSessionDialog();
    }

    public Task<bool> TryStartGameSession()
        => _client.StartGameSessionAsync(State.GameSession.Id);
}