namespace VttTools.WebApp.Server.Pages.Game.Schedule;

public sealed class GameSessionsPageHandler(GameSessionsPage page)
    : PageHandler<GameSessionsPageHandler, GameSessionsPage>(page) {
    private IGameHttpClient _gameClient = null!;
    private IServerLibraryHttpClient _libraryClient = null!;

    public async Task LoadGameSessionAsync(IGameHttpClient gameClient, IServerLibraryHttpClient libraryClient) {
        _gameClient = gameClient;
        _libraryClient = libraryClient;
        var data = await gameClient.GetGameSessionsAsync();
        Page.State.GameSessions = [.. data];
    }

    public async Task StartGameSessionCreating() {
        var adventures = await _libraryClient.GetAdventuresAsync();
        Page.State.Input = new() {
            Adventures = [.. adventures],
            AdventureId = adventures.FirstOrDefault()?.Id ?? Guid.Empty,
        };
        await LoadScenes(Page.State.Input.AdventureId);
        Page.State.IsCreating = true;
    }

    public void EndGameSessionCreating()
        => Page.State.IsCreating = false;

    public async Task SaveCreatedGameSession() {
        var request = new CreateGameSessionRequest {
            Title = Page.State.Input.Subject,
            SceneId = Page.State.Input.SceneId,
        };
        var result = await _gameClient.CreateGameSessionAsync(request);
        if (!result.IsSuccessful) {
            Page.State.Input.Errors = [.. result.Errors];
            return;
        }
        Page.State.GameSessions.Add(result.Value);
        EndGameSessionCreating();
    }

    public Task<bool> TryJoinGameSession(Guid sessionId)
        => _gameClient.JoinGameSessionAsync(sessionId);

    public async Task DeleteGameSession(Guid sessionId) {
        if (!await GameSessionsPage.DisplayConfirmation("Are you sure you want to delete this game session?"))
            return;

        var sessionToRemove = Page.State.GameSessions.FirstOrDefault(s => s.Id == sessionId);
        if (sessionToRemove == null)
            return;
        await _gameClient.DeleteGameSessionAsync(sessionId);
        Page.State.GameSessions.Remove(sessionToRemove);
    }

    // Handle selection of an adventure: load its scenes
    public async Task LoadScenes(Guid adventureId) {
        Page.State.Input.Scenes = [];
        Page.State.Input.SceneId = Guid.Empty;
        if (adventureId == Guid.Empty)
            return;
        var scenes = await _libraryClient.GetScenesAsync(adventureId);
        Page.State.Input.Scenes = [.. scenes];
        Page.State.Input.SceneId = scenes.FirstOrDefault()?.Id ?? Guid.Empty;
    }
}