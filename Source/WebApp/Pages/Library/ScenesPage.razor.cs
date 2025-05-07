namespace VttTools.WebApp.Pages.Library;

public partial class ScenesPage {
    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal ScenesPageState State => Handler.State;
    internal ScenesInputModel CreateInput => Handler.State.CreateInput;
    internal ScenesInputModel EditInput => Handler.State.EditInput;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(AdventureId, GameService);
        return true;
    }

    internal Task CreateScene()
        => Handler.SaveCreatedScene();

    internal void StartEdit(Scene ep)
        => Handler.StartSceneEditing(ep);

    internal void CancelEdit()
        => Handler.EndSceneEditing();

    internal Task SaveEdit()
        => Handler.SaveEditedScene();

    internal Task DeleteScene(Guid id)
        => Handler.DeleteScene(id);

    internal Task CloneScene(Guid id)
        => Handler.CloneScene(id);
}