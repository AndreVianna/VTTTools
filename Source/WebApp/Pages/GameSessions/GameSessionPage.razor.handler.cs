namespace VttTools.WebApp.Pages.GameSessions;

public class GameSessionPageHandler(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory loggerFactory)
    : PrivateComponentHandler<GameSessionPageHandler>(httpContext, navigationManager, user, loggerFactory) {
    private IGameService _service = null!;

    internal GameSessionPageState State { get; } = new();

    public Task<bool> TryConfigureAsync(IGameService service, Guid sessionId) {
        _service = service;
        return TryLoadGameSessionDetails(sessionId);
    }

    private async Task<bool> TryLoadGameSessionDetails(Guid sessionId) {
        var session = await _service.GetGameSessionByIdAsync(sessionId);
        if (session == null)
            return false;
        State.GameSession = session;
        State.CanEdit = session.OwnerId == CurrentUser.Id;
        State.CanStart = session.Players.FirstOrDefault(p => p.UserId == CurrentUser.Id)?.Type == PlayerType.Master;
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
        var result = await _service.UpdateGameSessionAsync(State.GameSession.Id, request);
        if (result.HasErrors) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.GameSession = result.Value;
        State.CanEdit = State.GameSession.OwnerId == CurrentUser.Id;
        State.CanStart = State.GameSession.Players.FirstOrDefault(p => p.UserId == CurrentUser.Id)?.Type == PlayerType.Master;
        CloseEditGameSessionDialog();
    }

    public Task<bool> TryStartGameSession()
        => _service.StartGameSessionAsync(State.GameSession.Id);
}