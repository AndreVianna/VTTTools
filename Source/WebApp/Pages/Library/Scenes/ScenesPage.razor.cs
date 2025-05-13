using VttTools.WebApp.Pages.Library.Scenes.Models;

namespace VttTools.WebApp.Pages.Library.Scenes;

public partial class ScenesPage {
    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal ILibraryClient LibraryClient { get; set; } = null!;

    internal ScenesPageState State { get; set; } = new();
    internal ScenesInputModel CreateInput => State.CreateInput;
    internal ScenesInputModel EditInput => State.EditInput;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadScenesAsync(AdventureId, LibraryClient);
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