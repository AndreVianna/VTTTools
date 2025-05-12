namespace VttTools.WebApp.Pages.Game.Schedule;

public sealed class GameSessionsPageHandler(IAuthenticatedPage component)
    : AuthenticatedPageHandler<GameSessionsPageHandler>(component) {
    private IGameClient _gameClient = null!;
    private ILibraryClient _libraryClient = null!;

    internal GameSessionsPageState State { get; } = new();

    public async Task LoadGameSessionAsync(IGameClient gameClient, ILibraryClient libraryClient) {
        _gameClient = gameClient;
        _libraryClient = libraryClient;
        var data = await gameClient.GetGameSessionsAsync();
        State.GameSessions = [.. data];
    }

    public async Task StartGameSessionCreating() {
        var adventures = await _libraryClient.GetAdventuresAsync();
        State.Input = new() {
            Adventures = [.. adventures],
            AdventureId = adventures.FirstOrDefault()?.Id ?? Guid.Empty,
        };
        await LoadScenes(State.Input.AdventureId);
        State.IsCreating = true;
    }

    public void EndGameSessionCreating()
        => State.IsCreating = false;

    public async Task SaveCreatedGameSession() {
        var request = new CreateGameSessionRequest {
            Title = State.Input.Subject,
            SceneId = State.Input.SceneId,
        };
        var result = await _gameClient.CreateGameSessionAsync(request);
        if (!result.IsSuccessful) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.GameSessions.Add(result.Value);
        EndGameSessionCreating();
    }

    public Task<bool> TryJoinGameSession(Guid sessionId)
        => _gameClient.JoinGameSessionAsync(sessionId);

    public async Task DeleteGameSession(Guid sessionId) {
        if (!await GameSessionsPage.DisplayConfirmation("Are you sure you want to delete this game session?"))
            return;

        var sessionToRemove = State.GameSessions.FirstOrDefault(s => s.Id == sessionId);
        if (sessionToRemove == null)
            return;
        await _gameClient.DeleteGameSessionAsync(sessionId);
        State.GameSessions.Remove(sessionToRemove);
    }

    // Handle selection of an adventure: load its scenes
    public async Task LoadScenes(Guid adventureId) {
        State.Input.Scenes = [];
        State.Input.SceneId = Guid.Empty;
        if (adventureId == Guid.Empty)
            return;
        var scenes = await _libraryClient.GetScenesAsync(adventureId);
        State.Input.Scenes = [.. scenes];
        State.Input.SceneId = scenes.FirstOrDefault()?.Id ?? Guid.Empty;
    }
}