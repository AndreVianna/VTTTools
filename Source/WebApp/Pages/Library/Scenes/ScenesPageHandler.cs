namespace VttTools.WebApp.Pages.Library.Scenes;

public sealed class ScenesPageHandler(ScenesPage page)
    : PageHandler<ScenesPageHandler, ScenesPage>(page) {
    private ILibraryClient _client = null!;

    public async Task LoadScenesAsync(Guid adventureId, ILibraryClient client) {
        _client = client;
        Page.State.AdventureId = adventureId;
        Page.State.Scenes = [.. await _client.GetScenesAsync(Page.State.AdventureId)];
    }

    public async Task SaveCreatedScene() {
        var request = new CreateSceneRequest {
            Name = Page.State.CreateInput.Name,
        };
        var result = await _client.CreateSceneAsync(Page.State.AdventureId, request);
        if (!result.IsSuccessful) {
            Page.State.CreateInput.Errors = [.. result.Errors];
            return;
        }
        Page.State.CreateInput = new();
        Page.State.Scenes.Add(result.Value);
        Page.State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteScene(Guid sceneId) {
        var deleted = await _client.RemoveSceneAsync(Page.State.AdventureId, sceneId);
        if (!deleted)
            return;
        Page.State.Scenes.RemoveAll(e => e.Id == sceneId);
    }

    public void StartSceneEditing(Scene ep) {
        Page.State.EditInput = new() {
            Id = ep.Id,
            Name = ep.Name,
            Visibility = ep.Visibility,
        };
        Page.State.IsEditing = true;
    }

    public void EndSceneEditing()
        => Page.State.IsEditing = false;

    public async Task SaveEditedScene() {
        var request = new UpdateSceneRequest {
            Name = Page.State.EditInput.Name,
            Visibility = Page.State.EditInput.Visibility,
        };
        var result = await _client.UpdateSceneAsync(Page.State.EditInput.Id, request);
        if (!result.IsSuccessful) {
            Page.State.EditInput.Errors = [.. result.Errors];
            return;
        }
        var scene = Page.State.Scenes.Find(e => e.Id == Page.State.EditInput.Id)!;
        scene.Name = Page.State.EditInput.Name;
        scene.Visibility = Page.State.EditInput.Visibility;
        Page.State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        EndSceneEditing();
    }

    public async Task CloneScene(Guid id) {
        var request = new AddClonedSceneRequest {
            SceneId = id,
            Name = Page.State.CreateInput.Name,
        };
        var result = await _client.CloneSceneAsync(Page.State.AdventureId, request);
        if (!result.IsSuccessful)
            return;
        Page.State.Scenes.Add(result.Value);
        Page.State.Scenes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }
}