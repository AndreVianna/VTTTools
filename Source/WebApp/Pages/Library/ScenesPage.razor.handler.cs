namespace VttTools.WebApp.Pages.Library;

public sealed class ScenesPageHandler(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory loggerFactory)
    : PrivateComponentHandler<ScenesPageHandler>(httpContext, navigationManager, user, loggerFactory) {
    private IGameService _service = null!;

    internal ScenesPageState State { get; } = new();

    public async Task ConfigureAsync(Guid adventureId, IGameService service) {
        _service = service;
        State.AdventureId = adventureId;
        State.Scenes = [.. await _service.GetScenesAsync(State.AdventureId)];
    }

    public async Task SaveCreatedScene() {
        var request = new CreateSceneRequest {
            Name = State.CreateInput.Name,
        };
        var result = await _service.CreateSceneAsync(State.AdventureId, request);
        if (!result.IsSuccessful) {
            State.CreateInput.Errors = [.. result.Errors];
            return;
        }
        State.CreateInput = new();
        State.Scenes.Add(result.Value);
        State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteScene(Guid sceneId) {
        var deleted = await _service.RemoveSceneAsync(State.AdventureId, sceneId);
        if (!deleted)
            return;
        State.Scenes.RemoveAll(e => e.Id == sceneId);
    }

    public void StartSceneEditing(Scene ep) {
        State.EditInput = new() {
            Id = ep.Id,
            Name = ep.Name,
            Visibility = ep.Visibility,
        };
        State.IsEditing = true;
    }

    public void EndSceneEditing()
        => State.IsEditing = false;

    public async Task SaveEditedScene() {
        var request = new UpdateSceneRequest {
            Name = State.EditInput.Name,
            Visibility = State.EditInput.Visibility,
        };
        var result = await _service.UpdateSceneAsync(State.EditInput.Id, request);
        if (!result.IsSuccessful) {
            State.EditInput.Errors = [.. result.Errors];
            return;
        }
        var scene = State.Scenes.Find(e => e.Id == State.EditInput.Id)!;
        scene.Name = State.EditInput.Name;
        scene.Visibility = State.EditInput.Visibility;
        State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        EndSceneEditing();
    }

    public async Task CloneScene(Guid id) {
        var request = new AddClonedSceneRequest {
            Id = id,
            Name = State.CreateInput.Name,
        };
        var result = await _service.CloneSceneAsync(State.AdventureId, request);
        if (!result.IsSuccessful)
            return;
        State.Scenes.Add(result.Value);
        State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }
}